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
exports.SushiController = void 0;
const vscode = __webpack_require__(1);
const vscode_1 = __webpack_require__(1);
const sushiWrapper_1 = __webpack_require__(3);
class SushiController {
    execute() {
        var currentFile = vscode.window.activeTextEditor?.document.uri;
        let diagnosticCollection;
        diagnosticCollection = vscode.languages.createDiagnosticCollection('fsh');
        if (currentFile) {
            vscode.window.showInformationMessage('Running Sushi...');
            let sushiWrapper = new sushiWrapper_1.SushiWrapper(currentFile.path);
            sushiWrapper.getSushiOutput().then((output) => {
                vscode.window.showInformationMessage('Sushi Done.');
                this.addDiagnostics(output, diagnosticCollection);
            });
        }
    }
    addDiagnostics(unfilteredOutput, diagnosticCollection) {
        let distinctOutput = this.filterToDistinctErrorMessages(unfilteredOutput);
        console.log(distinctOutput);
        let distinctOutputPerFile = this.groupOutputByFile(distinctOutput);
        for (const file in distinctOutputPerFile) {
            if (distinctOutputPerFile.hasOwnProperty(file)) {
                this.addDiagnosticsPerFile(distinctOutputPerFile, file, diagnosticCollection);
            }
            else {
                console.log("ERROR: distinctOutputPerFile hat die property file nicht!");
            }
        }
    }
    addDiagnosticsPerFile(distinctOutputPerFile, file, diagnosticCollection) {
        let findings = distinctOutputPerFile[file];
        let diagnostics = Array();
        findings.forEach(output => {
            diagnostics.push(new vscode_1.Diagnostic(output.range, output.message, output.severity));
        });
        diagnosticCollection.set(vscode.Uri.file(file), diagnostics);
    }
    filterToDistinctErrorMessages(output) {
        const isPropValuesEqual = (subject, target, propNames) => propNames.every(propName => subject[propName] === target[propName]);
        const getUniqueItemsByProperties = (items, propNames) => items.filter((item, index, array) => index === array.findIndex(foundItem => isPropValuesEqual(foundItem, item, propNames)));
        return getUniqueItemsByProperties(output, ['file', 'message', 'severity', 'lineFrom', 'lineTo']);
    }
    groupOutputByFile(output) {
        var groupBy = function (xs, key) {
            return xs.reduce(function (rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        };
        let groupedResult = groupBy(output, 'file');
        console.log(groupedResult);
        return groupedResult;
    }
}
exports.SushiController = SushiController;


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SushiWrapper = void 0;
const sushiOutputParser_1 = __webpack_require__(4);
class SushiWrapper {
    constructor(fshFilePath) {
        this.ressourcesFolderPath = this.getRessourcePath(fshFilePath);
        this.sushiOutputParser = new sushiOutputParser_1.SushiOutputParser();
    }
    getRessourcePath(fshFilePath) {
        var resPath = fshFilePath.split('/input/fsh')[0];
        if (resPath[0] === "/") {
            resPath = resPath.substring(1);
        }
        console.log(resPath);
        return resPath;
    }
    execShellCommand(cmd) {
        const exec = (__webpack_require__(6).exec);
        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    console.warn(error);
                }
                resolve(stdout ? stdout : stderr);
            });
        });
    }
    async getSushiOutput() {
        const sushiOutput = await this.execShellCommand("sushi " + this.ressourcesFolderPath);
        var output = this.sushiOutputParser.getParsedOutput(sushiOutput);
        return output;
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
        const regex = /(?<severity>\w+)\s(?<message>.*)\n\s+File:\s(?<file>.*)\n\s+Line:\s(?<line_from>\d+)(\s-\s(?<line_to>\d+))?/gm;
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
                var lineFrom = +(m.groups?.line_from) - 1;
                var lineTo = lineFrom;
                if (m.groups?.line_to != null) {
                    lineTo = +(m.groups?.line_to) - 1;
                }
                output.push(new sushiOutput_1.SushiOutput(severityType, m.groups?.message, m.groups?.file, new vscode_1.Range(lineFrom, 0, lineTo, 200)));
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
        this.lineFrom = range.start.line;
        this.lineTo = range.end.line;
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
        let sushiController = new sushiController_1.SushiController();
        sushiController.execute();
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