/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("vscode");

/***/ }),
/* 2 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.execute = void 0;
const vscode = __webpack_require__(1);
const vscode_1 = __webpack_require__(1);
const sushiWrapper_1 = __webpack_require__(3);
function execute(context, factory) {
    var currentFile = vscode.window.activeTextEditor?.document.uri;
    let diagnosticCollection;
    diagnosticCollection = vscode.languages.createDiagnosticCollection('fsh');
    let diagnostics = Array();
    if (currentFile) {
        var path = currentFile.path;
        console.log(path.toString());
        let sushiWrapper = new sushiWrapper_1.SushiWrapper(path);
        vscode.window.showInformationMessage('Running Sushi...');
        let output = sushiWrapper.getSushiOutput();
        vscode.window.showInformationMessage('Sushi Done.');
        output.forEach(output => {
            console.log(output.message);
            let d = new vscode_1.Diagnostic(output.range, output.message, output.severity);
            diagnostics.push(d);
        });
        diagnosticCollection.set(currentFile, diagnostics);
    }
}
exports.execute = execute;


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SushiWrapper = void 0;
const sushiOutputParser_1 = __webpack_require__(4);
var childProcess = __webpack_require__(6);
class SushiWrapper {
    constructor(fshFilePath) {
        this.ressourcesFolderPath = this.getRessourcePath(fshFilePath);
    }
    getRessourcePath(fshFilePath) {
        var resPath = fshFilePath.split('/input/fsh')[0];
        if (resPath[0] === "/") {
            resPath = resPath.substring(1);
        }
        console.log(resPath);
        return resPath;
    }
    runScript(command, args, callback) {
        console.log("Starting Process." + command);
        var child = childProcess.spawn(command, args);
        var scriptOutput = "";
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
            data = data.toString();
            scriptOutput += data;
        });
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
            data = data.toString();
            scriptOutput += data;
        });
        child.on('close', function (code) {
            callback(scriptOutput, code);
        });
    }
    startSushi() {
        console.log("running: sushi " + this.ressourcesFolderPath);
        this.runScript("sushi", [this.ressourcesFolderPath], function (output, exitCode) {
            // this.runScript("ls" , ["-l"], function(output, exitCode: any) {
            console.log("Process Finished.");
            console.log('closing code: ' + exitCode);
            console.log('Full output of script: ', output);
        });
    }
    startSushi2() {
        const cp = __webpack_require__(6);
        var sushiOutputParser = new sushiOutputParser_1.SushiOutputParser();
        cp.exec("sushi " + this.ressourcesFolderPath, (err, stdout, stderr) => {
            let output = sushiOutputParser.getParsedOutput(stdout);
            console.log(output[0].message);
            return output;
        });
        return [];
    }
    getSushiOutput() {
        return this.startSushi2();
        //return new SushiOutput(new Range(2,5,2,2),"Testmessage", SeverityType.error);
    }
}
exports.SushiWrapper = SushiWrapper;


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SushiOutputParser = void 0;
const vscode_1 = __webpack_require__(1);
const sushiOutput_1 = __webpack_require__(5);
class SushiOutputParser {
    getParsedOutput(logOutput) {
        //console.log("parsing: " + logOutput);
        return this.getElements(logOutput);
    }
    getElements(logOutput) {
        const regex = /(?<severity>\w+)\s(?<message>.*)\n\s+File:\s(?<file>.*)\n\s+Line:\s(?<line>\d+)/gm;
        let m;
        let output = [];
        while ((m = regex.exec(logOutput)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            var severityType = vscode_1.DiagnosticSeverity.Error;
            if (m.groups?.severity == "warn") {
                severityType = vscode_1.DiagnosticSeverity.Warning;
            }
            if (m.groups?.message != null) {
                var lineInt = +(m.groups?.line);
                output.push(new sushiOutput_1.SushiOutput(severityType, m.groups?.message, m.groups?.file, new vscode_1.Range(lineInt, 0, lineInt, 10)));
            }
        }
        return output;
    }
}
exports.SushiOutputParser = SushiOutputParser;


/***/ }),
/* 5 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SushiOutput = void 0;
class SushiOutput {
    constructor(severity, message, file, range) {
        this.severity = severity;
        this.message = message;
        this.file = file;
        this.range = range;
    }
}
exports.SushiOutput = SushiOutput;


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("child_process");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const vscode = __webpack_require__(1);
const sushiController_1 = __webpack_require__(2);
function activate(context) {
    let runSushiSubscription = vscode.commands.registerCommand('codfsh.runSushi', () => {
        (0, sushiController_1.execute)(context);
    });
    let runHapiSubscription = vscode.commands.registerCommand('codfsh.runHapi', () => {
        vscode.window.showInformationMessage('Running Hapi!');
    });
    let runFhirFshSubscription = vscode.commands.registerCommand('codfsh.runFhirFsh', () => {
        vscode.window.showInformationMessage('Running Sushi and Hapi!');
    });
    context.subscriptions.push(runSushiSubscription);
    context.subscriptions.push(runHapiSubscription);
    context.subscriptions.push(runFhirFshSubscription);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map