"use strict";
/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
/*
 * mockDebug.ts implements the Debug Adapter that "adapts" or translates the Debug Adapter Protocol (DAP) used by the client (e.g. VS Code)
 * into requests and events of the real "execution engine" or "debugger" (here: class MockRuntime).
 * When implementing your own debugger extension for VS Code, most of the work will go into the Debug Adapter.
 * Since the Debug Adapter is independent from VS Code, it can be used in any client (IDE) supporting the Debug Adapter Protocol.
 *
 * The most important class of the Debug Adapter is the MockDebugSession which implements many DAP requests by talking to the MockRuntime.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockDebugSession = void 0;
const debugadapter_1 = require("@vscode/debugadapter");
const path_browserify_1 = require("path-browserify");
const mockRuntime_1 = require("./mockRuntime");
const await_notify_1 = require("await-notify");
const base64 = require("base64-js");
class MockDebugSession extends debugadapter_1.LoggingDebugSession {
    /**
     * Creates a new debug adapter that is used for one debug session.
     * We configure the default implementation of a debug adapter here.
     */
    constructor(fileAccessor) {
        super("mock-debug.txt");
        this._variableHandles = new debugadapter_1.Handles();
        this._configurationDone = new await_notify_1.Subject();
        this._cancellationTokens = new Map();
        this._reportProgress = false;
        this._progressId = 10000;
        this._cancelledProgressId = undefined;
        this._isProgressCancellable = true;
        this._valuesInHex = false;
        this._useInvalidatedEvent = false;
        this._addressesInHex = true;
        // this debugger uses zero-based lines and columns
        this.setDebuggerLinesStartAt1(false);
        this.setDebuggerColumnsStartAt1(false);
        this._runtime = new mockRuntime_1.MockRuntime(fileAccessor);
        // setup event handlers
        this._runtime.on('stopOnEntry', () => {
            this.sendEvent(new debugadapter_1.StoppedEvent('entry', MockDebugSession.threadID));
        });
        this._runtime.on('stopOnStep', () => {
            this.sendEvent(new debugadapter_1.StoppedEvent('step', MockDebugSession.threadID));
        });
        this._runtime.on('stopOnBreakpoint', () => {
            this.sendEvent(new debugadapter_1.StoppedEvent('breakpoint', MockDebugSession.threadID));
        });
        this._runtime.on('stopOnDataBreakpoint', () => {
            this.sendEvent(new debugadapter_1.StoppedEvent('data breakpoint', MockDebugSession.threadID));
        });
        this._runtime.on('stopOnInstructionBreakpoint', () => {
            this.sendEvent(new debugadapter_1.StoppedEvent('instruction breakpoint', MockDebugSession.threadID));
        });
        this._runtime.on('stopOnException', (exception) => {
            if (exception) {
                this.sendEvent(new debugadapter_1.StoppedEvent(`exception(${exception})`, MockDebugSession.threadID));
            }
            else {
                this.sendEvent(new debugadapter_1.StoppedEvent('exception', MockDebugSession.threadID));
            }
        });
        this._runtime.on('breakpointValidated', (bp) => {
            this.sendEvent(new debugadapter_1.BreakpointEvent('changed', { verified: bp.verified, id: bp.id }));
        });
        this._runtime.on('output', (type, text, filePath, line, column) => {
            let category;
            switch (type) {
                case 'prio':
                    category = 'important';
                    break;
                case 'out':
                    category = 'stdout';
                    break;
                case 'err':
                    category = 'stderr';
                    break;
                default:
                    category = 'console';
                    break;
            }
            const e = new debugadapter_1.OutputEvent(`${text}\n`, category);
            if (text === 'start' || text === 'startCollapsed' || text === 'end') {
                e.body.group = text;
                e.body.output = `group-${text}\n`;
            }
            e.body.source = this.createSource(filePath);
            e.body.line = this.convertDebuggerLineToClient(line);
            e.body.column = this.convertDebuggerColumnToClient(column);
            this.sendEvent(e);
        });
        this._runtime.on('end', () => {
            this.sendEvent(new debugadapter_1.TerminatedEvent());
        });
    }
    /**
     * The 'initialize' request is the first request called by the frontend
     * to interrogate the features the debug adapter provides.
     */
    initializeRequest(response, args) {
        if (args.supportsProgressReporting) {
            this._reportProgress = true;
        }
        if (args.supportsInvalidatedEvent) {
            this._useInvalidatedEvent = true;
        }
        // build and return the capabilities of this debug adapter:
        response.body = response.body || {};
        // the adapter implements the configurationDone request.
        response.body.supportsConfigurationDoneRequest = true;
        // make VS Code use 'evaluate' when hovering over source
        response.body.supportsEvaluateForHovers = true;
        // make VS Code show a 'step back' button
        response.body.supportsStepBack = true;
        // make VS Code support data breakpoints
        response.body.supportsDataBreakpoints = true;
        // make VS Code support completion in REPL
        response.body.supportsCompletionsRequest = true;
        response.body.completionTriggerCharacters = [".", "["];
        // make VS Code send cancel request
        response.body.supportsCancelRequest = true;
        // make VS Code send the breakpointLocations request
        response.body.supportsBreakpointLocationsRequest = true;
        // make VS Code provide "Step in Target" functionality
        response.body.supportsStepInTargetsRequest = true;
        // the adapter defines two exceptions filters, one with support for conditions.
        response.body.supportsExceptionFilterOptions = true;
        response.body.exceptionBreakpointFilters = [
            {
                filter: 'namedException',
                label: "Named Exception",
                description: `Break on named exceptions. Enter the exception's name as the Condition.`,
                default: false,
                supportsCondition: true,
                conditionDescription: `Enter the exception's name`
            },
            {
                filter: 'otherExceptions',
                label: "Other Exceptions",
                description: 'This is a other exception',
                default: true,
                supportsCondition: false
            }
        ];
        // make VS Code send exceptionInfo request
        response.body.supportsExceptionInfoRequest = true;
        // make VS Code send setVariable request
        response.body.supportsSetVariable = true;
        // make VS Code send setExpression request
        response.body.supportsSetExpression = true;
        // make VS Code send disassemble request
        response.body.supportsDisassembleRequest = true;
        response.body.supportsSteppingGranularity = true;
        response.body.supportsInstructionBreakpoints = true;
        // make VS Code able to read and write variable memory
        response.body.supportsReadMemoryRequest = true;
        response.body.supportsWriteMemoryRequest = true;
        response.body.supportSuspendDebuggee = true;
        response.body.supportTerminateDebuggee = true;
        response.body.supportsFunctionBreakpoints = true;
        response.body.supportsDelayedStackTraceLoading = true;
        this.sendResponse(response);
        // since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
        // we request them early by sending an 'initializeRequest' to the frontend.
        // The frontend will end the configuration sequence by calling 'configurationDone' request.
        this.sendEvent(new debugadapter_1.InitializedEvent());
    }
    /**
     * Called at the end of the configuration sequence.
     * Indicates that all breakpoints etc. have been sent to the DA and that the 'launch' can start.
     */
    configurationDoneRequest(response, args) {
        super.configurationDoneRequest(response, args);
        // notify the launchRequest that configuration has finished
        this._configurationDone.notify();
    }
    disconnectRequest(response, args, request) {
        console.log(`disconnectRequest suspend: ${args.suspendDebuggee}, terminate: ${args.terminateDebuggee}`);
    }
    async attachRequest(response, args) {
        return this.launchRequest(response, args);
    }
    async launchRequest(response, args) {
        // make sure to 'Stop' the buffered logging if 'trace' is not set
        debugadapter_1.logger.setup(args.trace ? debugadapter_1.Logger.LogLevel.Verbose : debugadapter_1.Logger.LogLevel.Stop, false);
        // wait 1 second until configuration has finished (and configurationDoneRequest has been called)
        await this._configurationDone.wait(1000);
        // start the program in the runtime
        await this._runtime.start(args.program, !!args.stopOnEntry, !args.noDebug);
        if (args.compileError) {
            // simulate a compile/build error in "launch" request:
            // the error should not result in a modal dialog since 'showUser' is set to false.
            // A missing 'showUser' should result in a modal dialog.
            this.sendErrorResponse(response, {
                id: 1001,
                format: `compile error: some fake error.`,
                showUser: args.compileError === 'show' ? true : (args.compileError === 'hide' ? false : undefined)
            });
        }
        else {
            this.sendResponse(response);
        }
    }
    setFunctionBreakPointsRequest(response, args, request) {
        this.sendResponse(response);
    }
    async setBreakPointsRequest(response, args) {
        const path = args.source.path;
        const clientLines = args.lines || [];
        // clear all breakpoints for this file
        this._runtime.clearBreakpoints(path);
        // set and verify breakpoint locations
        const actualBreakpoints0 = clientLines.map(async (l) => {
            const { verified, line, id } = await this._runtime.setBreakPoint(path, this.convertClientLineToDebugger(l));
            const bp = new debugadapter_1.Breakpoint(verified, this.convertDebuggerLineToClient(line));
            bp.id = id;
            return bp;
        });
        const actualBreakpoints = await Promise.all(actualBreakpoints0);
        // send back the actual breakpoint positions
        response.body = {
            breakpoints: actualBreakpoints
        };
        this.sendResponse(response);
    }
    breakpointLocationsRequest(response, args, request) {
        if (args.source.path) {
            const bps = this._runtime.getBreakpoints(args.source.path, this.convertClientLineToDebugger(args.line));
            response.body = {
                breakpoints: bps.map(col => {
                    return {
                        line: args.line,
                        column: this.convertDebuggerColumnToClient(col)
                    };
                })
            };
        }
        else {
            response.body = {
                breakpoints: []
            };
        }
        this.sendResponse(response);
    }
    async setExceptionBreakPointsRequest(response, args) {
        let namedException = undefined;
        let otherExceptions = false;
        if (args.filterOptions) {
            for (const filterOption of args.filterOptions) {
                switch (filterOption.filterId) {
                    case 'namedException':
                        namedException = args.filterOptions[0].condition;
                        break;
                    case 'otherExceptions':
                        otherExceptions = true;
                        break;
                }
            }
        }
        if (args.filters) {
            if (args.filters.indexOf('otherExceptions') >= 0) {
                otherExceptions = true;
            }
        }
        this._runtime.setExceptionsFilters(namedException, otherExceptions);
        this.sendResponse(response);
    }
    exceptionInfoRequest(response, args) {
        response.body = {
            exceptionId: 'Exception ID',
            description: 'This is a descriptive description of the exception.',
            breakMode: 'always',
            details: {
                message: 'Message contained in the exception.',
                typeName: 'Short type name of the exception object',
                stackTrace: 'stack frame 1\nstack frame 2',
            }
        };
        this.sendResponse(response);
    }
    threadsRequest(response) {
        // runtime supports no threads so just return a default thread.
        response.body = {
            threads: [
                new debugadapter_1.Thread(MockDebugSession.threadID, "thread 1"),
                new debugadapter_1.Thread(MockDebugSession.threadID + 1, "thread 2"),
            ]
        };
        this.sendResponse(response);
    }
    stackTraceRequest(response, args) {
        const startFrame = typeof args.startFrame === 'number' ? args.startFrame : 0;
        const maxLevels = typeof args.levels === 'number' ? args.levels : 1000;
        const endFrame = startFrame + maxLevels;
        const stk = this._runtime.stack(startFrame, endFrame);
        response.body = {
            stackFrames: stk.frames.map((f, ix) => {
                const sf = new debugadapter_1.StackFrame(f.index, f.name, this.createSource(f.file), this.convertDebuggerLineToClient(f.line));
                if (typeof f.column === 'number') {
                    sf.column = this.convertDebuggerColumnToClient(f.column);
                }
                if (typeof f.instruction === 'number') {
                    const address = this.formatAddress(f.instruction);
                    sf.name = `${f.name} ${address}`;
                    sf.instructionPointerReference = address;
                }
                return sf;
            }),
            // 4 options for 'totalFrames':
            //omit totalFrames property: 	// VS Code has to probe/guess. Should result in a max. of two requests
            totalFrames: stk.count // stk.count is the correct size, should result in a max. of two requests
            //totalFrames: 1000000 			// not the correct size, should result in a max. of two requests
            //totalFrames: endFrame + 20 	// dynamically increases the size with every requested chunk, results in paging
        };
        this.sendResponse(response);
    }
    scopesRequest(response, args) {
        response.body = {
            scopes: [
                new debugadapter_1.Scope("Locals", this._variableHandles.create('locals'), false),
                new debugadapter_1.Scope("Globals", this._variableHandles.create('globals'), true)
            ]
        };
        this.sendResponse(response);
    }
    async writeMemoryRequest(response, { data, memoryReference, offset = 0 }) {
        const variable = this._variableHandles.get(Number(memoryReference));
        if (typeof variable === 'object') {
            const decoded = base64.toByteArray(data);
            variable.setMemory(decoded, offset);
            response.body = { bytesWritten: decoded.length };
        }
        else {
            response.body = { bytesWritten: 0 };
        }
        this.sendResponse(response);
        this.sendEvent(new debugadapter_1.InvalidatedEvent(['variables']));
    }
    async readMemoryRequest(response, { offset = 0, count, memoryReference }) {
        const variable = this._variableHandles.get(Number(memoryReference));
        if (typeof variable === 'object' && variable.memory) {
            const memory = variable.memory.subarray(Math.min(offset, variable.memory.length), Math.min(offset + count, variable.memory.length));
            response.body = {
                address: offset.toString(),
                data: base64.fromByteArray(memory),
                unreadableBytes: count - memory.length
            };
        }
        else {
            response.body = {
                address: offset.toString(),
                data: '',
                unreadableBytes: count
            };
        }
        this.sendResponse(response);
    }
    async variablesRequest(response, args, request) {
        let vs = [];
        const v = this._variableHandles.get(args.variablesReference);
        if (v === 'locals') {
            vs = this._runtime.getLocalVariables();
        }
        else if (v === 'globals') {
            if (request) {
                this._cancellationTokens.set(request.seq, false);
                vs = await this._runtime.getGlobalVariables(() => !!this._cancellationTokens.get(request.seq));
                this._cancellationTokens.delete(request.seq);
            }
            else {
                vs = await this._runtime.getGlobalVariables();
            }
        }
        else if (v && Array.isArray(v.value)) {
            vs = v.value;
        }
        response.body = {
            variables: vs.map(v => this.convertFromRuntime(v))
        };
        this.sendResponse(response);
    }
    setVariableRequest(response, args) {
        const container = this._variableHandles.get(args.variablesReference);
        const rv = container === 'locals'
            ? this._runtime.getLocalVariable(args.name)
            : container instanceof mockRuntime_1.RuntimeVariable && container.value instanceof Array
                ? container.value.find(v => v.name === args.name)
                : undefined;
        if (rv) {
            rv.value = this.convertToRuntime(args.value);
            response.body = this.convertFromRuntime(rv);
            if (rv.memory && rv.reference) {
                this.sendEvent(new debugadapter_1.MemoryEvent(String(rv.reference), 0, rv.memory.length));
            }
        }
        this.sendResponse(response);
    }
    continueRequest(response, args) {
        this._runtime.continue(false);
        this.sendResponse(response);
    }
    reverseContinueRequest(response, args) {
        this._runtime.continue(true);
        this.sendResponse(response);
    }
    nextRequest(response, args) {
        this._runtime.step(args.granularity === 'instruction', false);
        this.sendResponse(response);
    }
    stepBackRequest(response, args) {
        this._runtime.step(args.granularity === 'instruction', true);
        this.sendResponse(response);
    }
    stepInTargetsRequest(response, args) {
        const targets = this._runtime.getStepInTargets(args.frameId);
        response.body = {
            targets: targets.map(t => {
                return { id: t.id, label: t.label };
            })
        };
        this.sendResponse(response);
    }
    stepInRequest(response, args) {
        this._runtime.stepIn(args.targetId);
        this.sendResponse(response);
    }
    stepOutRequest(response, args) {
        this._runtime.stepOut();
        this.sendResponse(response);
    }
    async evaluateRequest(response, args) {
        let reply;
        let rv;
        switch (args.context) {
            case 'repl':
                // handle some REPL commands:
                // 'evaluate' supports to create and delete breakpoints from the 'repl':
                const matches = /new +([0-9]+)/.exec(args.expression);
                if (matches && matches.length === 2) {
                    const mbp = await this._runtime.setBreakPoint(this._runtime.sourceFile, this.convertClientLineToDebugger(parseInt(matches[1])));
                    const bp = new debugadapter_1.Breakpoint(mbp.verified, this.convertDebuggerLineToClient(mbp.line), undefined, this.createSource(this._runtime.sourceFile));
                    bp.id = mbp.id;
                    this.sendEvent(new debugadapter_1.BreakpointEvent('new', bp));
                    reply = `breakpoint created`;
                }
                else {
                    const matches = /del +([0-9]+)/.exec(args.expression);
                    if (matches && matches.length === 2) {
                        const mbp = this._runtime.clearBreakPoint(this._runtime.sourceFile, this.convertClientLineToDebugger(parseInt(matches[1])));
                        if (mbp) {
                            const bp = new debugadapter_1.Breakpoint(false);
                            bp.id = mbp.id;
                            this.sendEvent(new debugadapter_1.BreakpointEvent('removed', bp));
                            reply = `breakpoint deleted`;
                        }
                    }
                    else {
                        const matches = /progress/.exec(args.expression);
                        if (matches && matches.length === 1) {
                            if (this._reportProgress) {
                                reply = `progress started`;
                                this.progressSequence();
                            }
                            else {
                                reply = `frontend doesn't support progress (capability 'supportsProgressReporting' not set)`;
                            }
                        }
                    }
                }
            // fall through
            default:
                if (args.expression.startsWith('$')) {
                    rv = this._runtime.getLocalVariable(args.expression.substr(1));
                }
                else {
                    rv = new mockRuntime_1.RuntimeVariable('eval', this.convertToRuntime(args.expression));
                }
                break;
        }
        if (rv) {
            const v = this.convertFromRuntime(rv);
            response.body = {
                result: v.value,
                type: v.type,
                variablesReference: v.variablesReference,
                presentationHint: v.presentationHint
            };
        }
        else {
            response.body = {
                result: reply ? reply : `evaluate(context: '${args.context}', '${args.expression}')`,
                variablesReference: 0
            };
        }
        this.sendResponse(response);
    }
    setExpressionRequest(response, args) {
        if (args.expression.startsWith('$')) {
            const rv = this._runtime.getLocalVariable(args.expression.substr(1));
            if (rv) {
                rv.value = this.convertToRuntime(args.value);
                response.body = this.convertFromRuntime(rv);
                this.sendResponse(response);
            }
            else {
                this.sendErrorResponse(response, {
                    id: 1002,
                    format: `variable '{lexpr}' not found`,
                    variables: { lexpr: args.expression },
                    showUser: true
                });
            }
        }
        else {
            this.sendErrorResponse(response, {
                id: 1003,
                format: `'{lexpr}' not an assignable expression`,
                variables: { lexpr: args.expression },
                showUser: true
            });
        }
    }
    async progressSequence() {
        const ID = '' + this._progressId++;
        await (0, mockRuntime_1.timeout)(100);
        const title = this._isProgressCancellable ? 'Cancellable operation' : 'Long running operation';
        const startEvent = new debugadapter_1.ProgressStartEvent(ID, title);
        startEvent.body.cancellable = this._isProgressCancellable;
        this._isProgressCancellable = !this._isProgressCancellable;
        this.sendEvent(startEvent);
        this.sendEvent(new debugadapter_1.OutputEvent(`start progress: ${ID}\n`));
        let endMessage = 'progress ended';
        for (let i = 0; i < 100; i++) {
            await (0, mockRuntime_1.timeout)(500);
            this.sendEvent(new debugadapter_1.ProgressUpdateEvent(ID, `progress: ${i}`));
            if (this._cancelledProgressId === ID) {
                endMessage = 'progress cancelled';
                this._cancelledProgressId = undefined;
                this.sendEvent(new debugadapter_1.OutputEvent(`cancel progress: ${ID}\n`));
                break;
            }
        }
        this.sendEvent(new debugadapter_1.ProgressEndEvent(ID, endMessage));
        this.sendEvent(new debugadapter_1.OutputEvent(`end progress: ${ID}\n`));
        this._cancelledProgressId = undefined;
    }
    dataBreakpointInfoRequest(response, args) {
        response.body = {
            dataId: null,
            description: "cannot break on data access",
            accessTypes: undefined,
            canPersist: false
        };
        if (args.variablesReference && args.name) {
            const v = this._variableHandles.get(args.variablesReference);
            if (v === 'globals') {
                response.body.dataId = args.name;
                response.body.description = args.name;
                response.body.accessTypes = ["write"];
                response.body.canPersist = true;
            }
            else {
                response.body.dataId = args.name;
                response.body.description = args.name;
                response.body.accessTypes = ["read", "write", "readWrite"];
                response.body.canPersist = true;
            }
        }
        this.sendResponse(response);
    }
    setDataBreakpointsRequest(response, args) {
        // clear all data breakpoints
        this._runtime.clearAllDataBreakpoints();
        response.body = {
            breakpoints: []
        };
        for (const dbp of args.breakpoints) {
            const ok = this._runtime.setDataBreakpoint(dbp.dataId, dbp.accessType || 'write');
            response.body.breakpoints.push({
                verified: ok
            });
        }
        this.sendResponse(response);
    }
    completionsRequest(response, args) {
        response.body = {
            targets: [
                {
                    label: "item 10",
                    sortText: "10"
                },
                {
                    label: "item 1",
                    sortText: "01",
                    detail: "detail 1"
                },
                {
                    label: "item 2",
                    sortText: "02",
                    detail: "detail 2"
                },
                {
                    label: "array[]",
                    selectionStart: 6,
                    sortText: "03"
                },
                {
                    label: "func(arg)",
                    selectionStart: 5,
                    selectionLength: 3,
                    sortText: "04"
                }
            ]
        };
        this.sendResponse(response);
    }
    cancelRequest(response, args) {
        if (args.requestId) {
            this._cancellationTokens.set(args.requestId, true);
        }
        if (args.progressId) {
            this._cancelledProgressId = args.progressId;
        }
    }
    disassembleRequest(response, args) {
        const baseAddress = parseInt(args.memoryReference);
        const offset = args.instructionOffset || 0;
        const count = args.instructionCount;
        const isHex = args.memoryReference.startsWith('0x');
        const pad = isHex ? args.memoryReference.length - 2 : args.memoryReference.length;
        const loc = this.createSource(this._runtime.sourceFile);
        let lastLine = -1;
        const instructions = this._runtime.disassemble(baseAddress + offset, count).map(instruction => {
            const address = instruction.address.toString(isHex ? 16 : 10).padStart(pad, '0');
            const instr = {
                address: isHex ? `0x${address}` : `${address}`,
                instruction: instruction.instruction
            };
            // if instruction's source starts on a new line add the source to instruction
            if (instruction.line !== undefined && lastLine !== instruction.line) {
                lastLine = instruction.line;
                instr.location = loc;
                instr.line = this.convertDebuggerLineToClient(instruction.line);
            }
            return instr;
        });
        response.body = {
            instructions: instructions
        };
        this.sendResponse(response);
    }
    setInstructionBreakpointsRequest(response, args) {
        // clear all instruction breakpoints
        this._runtime.clearInstructionBreakpoints();
        // set instruction breakpoints
        const breakpoints = args.breakpoints.map(ibp => {
            const address = parseInt(ibp.instructionReference);
            const offset = ibp.offset || 0;
            return {
                verified: this._runtime.setInstructionBreakpoint(address + offset)
            };
        });
        response.body = {
            breakpoints: breakpoints
        };
        this.sendResponse(response);
    }
    customRequest(command, response, args) {
        if (command === 'toggleFormatting') {
            this._valuesInHex = !this._valuesInHex;
            if (this._useInvalidatedEvent) {
                this.sendEvent(new debugadapter_1.InvalidatedEvent(['variables']));
            }
            this.sendResponse(response);
        }
        else {
            super.customRequest(command, response, args);
        }
    }
    //---- helpers
    convertToRuntime(value) {
        value = value.trim();
        if (value === 'true') {
            return true;
        }
        if (value === 'false') {
            return false;
        }
        if (value[0] === '\'' || value[0] === '"') {
            return value.substr(1, value.length - 2);
        }
        const n = parseFloat(value);
        if (!isNaN(n)) {
            return n;
        }
        return value;
    }
    convertFromRuntime(v) {
        let dapVariable = {
            name: v.name,
            value: '???',
            type: typeof v.value,
            variablesReference: 0,
            evaluateName: '$' + v.name
        };
        if (v.name.indexOf('lazy') >= 0) {
            // a "lazy" variable needs an additional click to retrieve its value
            dapVariable.value = 'lazy var'; // placeholder value
            v.reference ?? (v.reference = this._variableHandles.create(new mockRuntime_1.RuntimeVariable('', [new mockRuntime_1.RuntimeVariable('', v.value)])));
            dapVariable.variablesReference = v.reference;
            dapVariable.presentationHint = { lazy: true };
        }
        else {
            if (Array.isArray(v.value)) {
                dapVariable.value = 'Object';
                v.reference ?? (v.reference = this._variableHandles.create(v));
                dapVariable.variablesReference = v.reference;
            }
            else {
                switch (typeof v.value) {
                    case 'number':
                        if (Math.round(v.value) === v.value) {
                            dapVariable.value = this.formatNumber(v.value);
                            dapVariable.__vscodeVariableMenuContext = 'simple'; // enable context menu contribution
                            dapVariable.type = 'integer';
                        }
                        else {
                            dapVariable.value = v.value.toString();
                            dapVariable.type = 'float';
                        }
                        break;
                    case 'string':
                        dapVariable.value = `"${v.value}"`;
                        break;
                    case 'boolean':
                        dapVariable.value = v.value ? 'true' : 'false';
                        break;
                    default:
                        dapVariable.value = typeof v.value;
                        break;
                }
            }
        }
        if (v.memory) {
            v.reference ?? (v.reference = this._variableHandles.create(v));
            dapVariable.memoryReference = String(v.reference);
        }
        return dapVariable;
    }
    formatAddress(x, pad = 8) {
        return this._addressesInHex ? '0x' + x.toString(16).padStart(8, '0') : x.toString(10);
    }
    formatNumber(x) {
        return this._valuesInHex ? '0x' + x.toString(16) : x.toString(10);
    }
    createSource(filePath) {
        return new debugadapter_1.Source((0, path_browserify_1.basename)(filePath), this.convertDebuggerPathToClient(filePath), undefined, undefined, 'mock-adapter-data');
    }
}
exports.MockDebugSession = MockDebugSession;
// we don't support multiple threads, so we can use a hardcoded ID for the default thread
MockDebugSession.threadID = 1;
//# sourceMappingURL=mockDebug.js.map