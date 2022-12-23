"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockRuntime = exports.timeout = exports.RuntimeVariable = void 0;
const events_1 = require("events");
class RuntimeVariable {
    get value() {
        return this._value;
    }
    set value(value) {
        this._value = value;
        this._memory = undefined;
    }
    get memory() {
        if (this._memory === undefined && typeof this._value === 'string') {
            this._memory = new TextEncoder().encode(this._value);
        }
        return this._memory;
    }
    constructor(name, _value) {
        this.name = name;
        this._value = _value;
    }
    setMemory(data, offset = 0) {
        const memory = this.memory;
        if (!memory) {
            return;
        }
        memory.set(data, offset);
        this._memory = memory;
        this._value = new TextDecoder().decode(memory);
    }
}
exports.RuntimeVariable = RuntimeVariable;
function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
exports.timeout = timeout;
/**
 * A Mock runtime with minimal debugger functionality.
 * MockRuntime is a hypothetical (aka "Mock") "execution engine with debugging support":
 * it takes a Markdown (*.md) file and "executes" it by "running" through the text lines
 * and searching for "command" patterns that trigger some debugger related functionality (e.g. exceptions).
 * When it finds a command it typically emits an event.
 * The runtime can not only run through the whole file but also executes one line at a time
 * and stops on lines for which a breakpoint has been registered. This functionality is the
 * core of the "debugging support".
 * Since the MockRuntime is completely independent from VS Code or the Debug Adapter Protocol,
 * it can be viewed as a simplified representation of a real "execution engine" (e.g. node.js)
 * or debugger (e.g. gdb).
 * When implementing your own debugger extension for VS Code, you probably don't need this
 * class because you can rely on some existing debugger or runtime.
 */
class MockRuntime extends events_1.EventEmitter {
    get sourceFile() {
        return this._sourceFile;
    }
    get currentLine() {
        return this._currentLine;
    }
    set currentLine(x) {
        this._currentLine = x;
        this.instruction = this.starts[x];
    }
    constructor(fileAccessor) {
        super();
        this.fileAccessor = fileAccessor;
        // the initial (and one and only) file we are 'debugging'
        this._sourceFile = '';
        this.variables = new Map();
        // the contents (= lines) of the one and only file
        this.sourceLines = [];
        this.instructions = [];
        this.starts = [];
        this.ends = [];
        // This is the next line that will be 'executed'
        this._currentLine = 0;
        // This is the next instruction that will be 'executed'
        this.instruction = 0;
        // maps from sourceFile to array of IRuntimeBreakpoint
        this.breakPoints = new Map();
        // all instruction breakpoint addresses
        this.instructionBreakpoints = new Set();
        // since we want to send breakpoint events, we will assign an id to every event
        // so that the frontend can match events with breakpoints.
        this.breakpointId = 1;
        this.breakAddresses = new Map();
        this.otherExceptions = false;
    }
    /**
     * Start executing the given program.
     */
    async start(program, stopOnEntry, debug) {
        await this.loadSource(this.normalizePathAndCasing(program));
        if (debug) {
            await this.verifyBreakpoints(this._sourceFile);
            if (stopOnEntry) {
                this.findNextStatement(false, 'stopOnEntry');
            }
            else {
                // we just start to run until we hit a breakpoint, an exception, or the end of the program
                this.continue(false);
            }
        }
        else {
            this.continue(false);
        }
    }
    /**
     * Continue execution to the end/beginning.
     */
    continue(reverse) {
        while (!this.executeLine(this.currentLine, reverse)) {
            if (this.updateCurrentLine(reverse)) {
                break;
            }
            if (this.findNextStatement(reverse)) {
                break;
            }
        }
    }
    /**
     * Step to the next/previous non empty line.
     */
    step(instruction, reverse) {
        if (instruction) {
            if (reverse) {
                this.instruction--;
            }
            else {
                this.instruction++;
            }
            this.sendEvent('stopOnStep');
        }
        else {
            if (!this.executeLine(this.currentLine, reverse)) {
                if (!this.updateCurrentLine(reverse)) {
                    this.findNextStatement(reverse, 'stopOnStep');
                }
            }
        }
    }
    updateCurrentLine(reverse) {
        if (reverse) {
            if (this.currentLine > 0) {
                this.currentLine--;
            }
            else {
                // no more lines: stop at first line
                this.currentLine = 0;
                this.currentColumn = undefined;
                this.sendEvent('stopOnEntry');
                return true;
            }
        }
        else {
            if (this.currentLine < this.sourceLines.length - 1) {
                this.currentLine++;
            }
            else {
                // no more lines: run to end
                this.currentColumn = undefined;
                this.sendEvent('end');
                return true;
            }
        }
        return false;
    }
    /**
     * "Step into" for Mock debug means: go to next character
     */
    stepIn(targetId) {
        if (typeof targetId === 'number') {
            this.currentColumn = targetId;
            this.sendEvent('stopOnStep');
        }
        else {
            if (typeof this.currentColumn === 'number') {
                if (this.currentColumn <= this.sourceLines[this.currentLine].length) {
                    this.currentColumn += 1;
                }
            }
            else {
                this.currentColumn = 1;
            }
            this.sendEvent('stopOnStep');
        }
    }
    /**
     * "Step out" for Mock debug means: go to previous character
     */
    stepOut() {
        if (typeof this.currentColumn === 'number') {
            this.currentColumn -= 1;
            if (this.currentColumn === 0) {
                this.currentColumn = undefined;
            }
        }
        this.sendEvent('stopOnStep');
    }
    getStepInTargets(frameId) {
        const line = this.getLine();
        const words = this.getWords(this.currentLine, line);
        // return nothing if frameId is out of range
        if (frameId < 0 || frameId >= words.length) {
            return [];
        }
        const { name, index } = words[frameId];
        // make every character of the frame a potential "step in" target
        return name.split('').map((c, ix) => {
            return {
                id: index + ix,
                label: `target: ${c}`
            };
        });
    }
    /**
     * Returns a fake 'stacktrace' where every 'stackframe' is a word from the current line.
     */
    stack(startFrame, endFrame) {
        const line = this.getLine();
        const words = this.getWords(this.currentLine, line);
        words.push({ name: 'BOTTOM', line: -1, index: -1 }); // add a sentinel so that the stack is never empty...
        // if the line contains the word 'disassembly' we support to "disassemble" the line by adding an 'instruction' property to the stackframe
        const instruction = line.indexOf('disassembly') >= 0 ? this.instruction : undefined;
        const column = typeof this.currentColumn === 'number' ? this.currentColumn : undefined;
        const frames = [];
        // every word of the current line becomes a stack frame.
        for (let i = startFrame; i < Math.min(endFrame, words.length); i++) {
            const stackFrame = {
                index: i,
                name: `${words[i].name}(${i})`,
                file: this._sourceFile,
                line: this.currentLine,
                column: column,
                instruction: instruction
            };
            frames.push(stackFrame);
        }
        return {
            frames: frames,
            count: words.length
        };
    }
    /*
     * Determine possible column breakpoint positions for the given line.
     * Here we return the start location of words with more than 8 characters.
     */
    getBreakpoints(path, line) {
        return this.getWords(line, this.getLine(line)).filter(w => w.name.length > 8).map(w => w.index);
    }
    /*
     * Set breakpoint in file with given line.
     */
    async setBreakPoint(path, line) {
        path = this.normalizePathAndCasing(path);
        const bp = { verified: false, line, id: this.breakpointId++ };
        let bps = this.breakPoints.get(path);
        if (!bps) {
            bps = new Array();
            this.breakPoints.set(path, bps);
        }
        bps.push(bp);
        await this.verifyBreakpoints(path);
        return bp;
    }
    /*
     * Clear breakpoint in file with given line.
     */
    clearBreakPoint(path, line) {
        const bps = this.breakPoints.get(this.normalizePathAndCasing(path));
        if (bps) {
            const index = bps.findIndex(bp => bp.line === line);
            if (index >= 0) {
                const bp = bps[index];
                bps.splice(index, 1);
                return bp;
            }
        }
        return undefined;
    }
    clearBreakpoints(path) {
        this.breakPoints.delete(this.normalizePathAndCasing(path));
    }
    setDataBreakpoint(address, accessType) {
        const x = accessType === 'readWrite' ? 'read write' : accessType;
        const t = this.breakAddresses.get(address);
        if (t) {
            if (t !== x) {
                this.breakAddresses.set(address, 'read write');
            }
        }
        else {
            this.breakAddresses.set(address, x);
        }
        return true;
    }
    clearAllDataBreakpoints() {
        this.breakAddresses.clear();
    }
    setExceptionsFilters(namedException, otherExceptions) {
        this.namedException = namedException;
        this.otherExceptions = otherExceptions;
    }
    setInstructionBreakpoint(address) {
        this.instructionBreakpoints.add(address);
        return true;
    }
    clearInstructionBreakpoints() {
        this.instructionBreakpoints.clear();
    }
    async getGlobalVariables(cancellationToken) {
        let a = [];
        for (let i = 0; i < 10; i++) {
            a.push(new RuntimeVariable(`global_${i}`, i));
            if (cancellationToken && cancellationToken()) {
                break;
            }
            await timeout(1000);
        }
        return a;
    }
    getLocalVariables() {
        return Array.from(this.variables, ([name, value]) => value);
    }
    getLocalVariable(name) {
        return this.variables.get(name);
    }
    /**
     * Return words of the given address range as "instructions"
     */
    disassemble(address, instructionCount) {
        const instructions = [];
        for (let a = address; a < address + instructionCount; a++) {
            if (a >= 0 && a < this.instructions.length) {
                instructions.push({
                    address: a,
                    instruction: this.instructions[a].name,
                    line: this.instructions[a].line
                });
            }
            else {
                instructions.push({
                    address: a,
                    instruction: 'nop'
                });
            }
        }
        return instructions;
    }
    // private methods
    getLine(line) {
        return this.sourceLines[line === undefined ? this.currentLine : line].trim();
    }
    getWords(l, line) {
        // break line into words
        const WORD_REGEXP = /[a-z]+/ig;
        const words = [];
        let match;
        while (match = WORD_REGEXP.exec(line)) {
            words.push({ name: match[0], line: l, index: match.index });
        }
        return words;
    }
    async loadSource(file) {
        if (this._sourceFile !== file) {
            this._sourceFile = this.normalizePathAndCasing(file);
            this.initializeContents(await this.fileAccessor.readFile(file));
        }
    }
    initializeContents(memory) {
        this.sourceLines = new TextDecoder().decode(memory).split(/\r?\n/);
        this.instructions = [];
        this.starts = [];
        this.instructions = [];
        this.ends = [];
        for (let l = 0; l < this.sourceLines.length; l++) {
            this.starts.push(this.instructions.length);
            const words = this.getWords(l, this.sourceLines[l]);
            for (let word of words) {
                this.instructions.push(word);
            }
            this.ends.push(this.instructions.length);
        }
    }
    /**
     * return true on stop
     */
    findNextStatement(reverse, stepEvent) {
        for (let ln = this.currentLine; reverse ? ln >= 0 : ln < this.sourceLines.length; reverse ? ln-- : ln++) {
            // is there a source breakpoint?
            const breakpoints = this.breakPoints.get(this._sourceFile);
            if (breakpoints) {
                const bps = breakpoints.filter(bp => bp.line === ln);
                if (bps.length > 0) {
                    // send 'stopped' event
                    this.sendEvent('stopOnBreakpoint');
                    // the following shows the use of 'breakpoint' events to update properties of a breakpoint in the UI
                    // if breakpoint is not yet verified, verify it now and send a 'breakpoint' update event
                    if (!bps[0].verified) {
                        bps[0].verified = true;
                        this.sendEvent('breakpointValidated', bps[0]);
                    }
                    this.currentLine = ln;
                    return true;
                }
            }
            const line = this.getLine(ln);
            if (line.length > 0) {
                this.currentLine = ln;
                break;
            }
        }
        if (stepEvent) {
            this.sendEvent(stepEvent);
            return true;
        }
        return false;
    }
    /**
     * "execute a line" of the readme markdown.
     * Returns true if execution sent out a stopped event and needs to stop.
     */
    executeLine(ln, reverse) {
        // first "execute" the instructions associated with this line and potentially hit instruction breakpoints
        while (reverse ? this.instruction >= this.starts[ln] : this.instruction < this.ends[ln]) {
            reverse ? this.instruction-- : this.instruction++;
            if (this.instructionBreakpoints.has(this.instruction)) {
                this.sendEvent('stopOnInstructionBreakpoint');
                return true;
            }
        }
        const line = this.getLine(ln);
        // find variable accesses
        let reg0 = /\$([a-z][a-z0-9]*)(=(false|true|[0-9]+(\.[0-9]+)?|\".*\"|\{.*\}))?/ig;
        let matches0;
        while (matches0 = reg0.exec(line)) {
            if (matches0.length === 5) {
                let access;
                const name = matches0[1];
                const value = matches0[3];
                let v = new RuntimeVariable(name, value);
                if (value && value.length > 0) {
                    if (value === 'true') {
                        v.value = true;
                    }
                    else if (value === 'false') {
                        v.value = false;
                    }
                    else if (value[0] === '"') {
                        v.value = value.slice(1, -1);
                    }
                    else if (value[0] === '{') {
                        v.value = [
                            new RuntimeVariable('fBool', true),
                            new RuntimeVariable('fInteger', 123),
                            new RuntimeVariable('fString', 'hello'),
                            new RuntimeVariable('flazyInteger', 321)
                        ];
                    }
                    else {
                        v.value = parseFloat(value);
                    }
                    if (this.variables.has(name)) {
                        // the first write access to a variable is the "declaration" and not a "write access"
                        access = 'write';
                    }
                    this.variables.set(name, v);
                }
                else {
                    if (this.variables.has(name)) {
                        // variable must exist in order to trigger a read access
                        access = 'read';
                    }
                }
                const accessType = this.breakAddresses.get(name);
                if (access && accessType && accessType.indexOf(access) >= 0) {
                    this.sendEvent('stopOnDataBreakpoint', access);
                    return true;
                }
            }
        }
        // if 'log(...)' found in source -> send argument to debug console
        const reg1 = /(log|prio|out|err)\(([^\)]*)\)/g;
        let matches1;
        while (matches1 = reg1.exec(line)) {
            if (matches1.length === 3) {
                this.sendEvent('output', matches1[1], matches1[2], this._sourceFile, ln, matches1.index);
            }
        }
        // if pattern 'exception(...)' found in source -> throw named exception
        const matches2 = /exception\((.*)\)/.exec(line);
        if (matches2 && matches2.length === 2) {
            const exception = matches2[1].trim();
            if (this.namedException === exception) {
                this.sendEvent('stopOnException', exception);
                return true;
            }
            else {
                if (this.otherExceptions) {
                    this.sendEvent('stopOnException', undefined);
                    return true;
                }
            }
        }
        else {
            // if word 'exception' found in source -> throw exception
            if (line.indexOf('exception') >= 0) {
                if (this.otherExceptions) {
                    this.sendEvent('stopOnException', undefined);
                    return true;
                }
            }
        }
        // nothing interesting found -> continue
        return false;
    }
    async verifyBreakpoints(path) {
        const bps = this.breakPoints.get(path);
        if (bps) {
            await this.loadSource(path);
            bps.forEach(bp => {
                if (!bp.verified && bp.line < this.sourceLines.length) {
                    const srcLine = this.getLine(bp.line);
                    // if a line is empty or starts with '+' we don't allow to set a breakpoint but move the breakpoint down
                    if (srcLine.length === 0 || srcLine.indexOf('+') === 0) {
                        bp.line++;
                    }
                    // if a line starts with '-' we don't allow to set a breakpoint but move the breakpoint up
                    if (srcLine.indexOf('-') === 0) {
                        bp.line--;
                    }
                    // don't set 'verified' to true if the line contains the word 'lazy'
                    // in this case the breakpoint will be verified 'lazy' after hitting it once.
                    if (srcLine.indexOf('lazy') < 0) {
                        bp.verified = true;
                        this.sendEvent('breakpointValidated', bp);
                    }
                }
            });
        }
    }
    sendEvent(event, ...args) {
        setTimeout(() => {
            this.emit(event, ...args);
        }, 0);
    }
    normalizePathAndCasing(path) {
        if (this.fileAccessor.isWindows) {
            return path.replace(/\//g, '\\').toLowerCase();
        }
        else {
            return path.replace(/\\/g, '/');
        }
    }
}
exports.MockRuntime = MockRuntime;
//# sourceMappingURL=mockRuntime.js.map