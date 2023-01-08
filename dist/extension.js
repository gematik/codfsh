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
const sushiWrapper_1 = __webpack_require__(3);
const diagnosticController_1 = __webpack_require__(9);
const sushiOutputParser_1 = __webpack_require__(4);
class SushiController {
    constructor(diagnosticCollection) {
        this.sushiWrapper = new sushiWrapper_1.SushiWrapper();
        this.diagnosticController = new diagnosticController_1.DiagnosticController(diagnosticCollection);
        this.sushiOutputParser = new sushiOutputParser_1.SushiOutputParser();
    }
    execute() {
        var currentFile = vscode.window.activeTextEditor?.document.uri;
        if (currentFile) {
            vscode.window.showInformationMessage('Running Sushi...');
            this.sushiWrapper.getConsoleOutput(currentFile.path)
                .then((consoleOutput) => {
                var diagnostics = this.sushiOutputParser.getDiagnostics(consoleOutput);
                this.diagnosticController.addDiagnostics(diagnostics);
                vscode.window.showInformationMessage('Sushi Completed.');
            }).catch((error) => {
                console.log(error);
                vscode.window.showErrorMessage(error);
            });
        }
    }
}
exports.SushiController = SushiController;


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SushiWrapper = void 0;
class SushiWrapper {
    async getConsoleOutput(fshFilePath) {
        return new Promise((resolve, reject) => {
            this.getRessourcePath(fshFilePath).then((ressourcesFolderPath) => {
                resolve(this.execShellCommand("sushi " + ressourcesFolderPath));
            }).catch((error) => {
                reject(error);
            });
        });
    }
    getRessourcePath(fshFilePath) {
        return new Promise((resolve, reject) => {
            var resPath = this.searchRessourcePath(fshFilePath, '/input/fsh');
            if (this.isValidPath(resPath)) {
                resolve(resPath);
            }
            resPath = this.searchRessourcePath(fshFilePath, '/_preprocessed');
            if (this.isValidPath(resPath)) {
                resolve(resPath);
            }
            reject(new Error("Unable to find folder structure expected by SUSHI for a FSH project"));
        });
    }
    searchRessourcePath(fshFilePath, input) {
        var resPath = fshFilePath.split(input)[0];
        if (resPath[0] === "/") {
            resPath = resPath.substring(1);
        }
        return resPath;
    }
    isValidPath(resPath) {
        console.log(resPath);
        if (resPath.split('/').pop() === "Resources") {
            return true;
        }
        return false;
    }
    execShellCommand(cmd) {
        const exec = (__webpack_require__(6).exec);
        return new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    console.log(error);
                    //reject(new Error(error));
                }
                resolve(stdout);
            });
        });
    }
}
exports.SushiWrapper = SushiWrapper;


/***/ }),
/* 4 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SushiOutputParser = void 0;
const vscode_1 = __webpack_require__(1);
const diagnostic_1 = __webpack_require__(5);
class SushiOutputParser {
    getDiagnostics(logOutput) {
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
                output.push(new diagnostic_1.Diagniostic(severityType, m.groups?.message, m.groups?.file, new vscode_1.Range(lineFrom, 0, lineTo, 200)));
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
exports.Diagniostic = void 0;
class Diagniostic {
    constructor(severity, message, file, range) {
        this.severity = severity;
        this.message = message;
        this.file = file;
        this.range = range;
        this.lineFrom = range.start.line;
        this.lineTo = range.end.line;
    }
}
exports.Diagniostic = Diagniostic;


/***/ }),
/* 6 */
/***/ ((module) => {

module.exports = require("child_process");

/***/ }),
/* 7 */,
/* 8 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DiagnosticManipulator = void 0;
class DiagnosticManipulator {
    manipulate(diagnostics) {
        let distinctDiagnostics = this.filterToDistinctErrorMessages(diagnostics);
        let distinctDiagnosticsPerFile = this.groupOutputByFile(distinctDiagnostics);
        return distinctDiagnosticsPerFile;
    }
    filterToDistinctErrorMessages(diagnistics) {
        const isPropValuesEqual = (subject, target, propNames) => propNames.every(propName => subject[propName] === target[propName]);
        const getUniqueItemsByProperties = (items, propNames) => items.filter((item, index, array) => index === array.findIndex(foundItem => isPropValuesEqual(foundItem, item, propNames)));
        return getUniqueItemsByProperties(diagnistics, ['file', 'message', 'severity', 'lineFrom', 'lineTo']);
    }
    groupOutputByFile(diagnostics) {
        var groupBy = function (xs, key) {
            return xs.reduce(function (rv, x) {
                (rv[x[key]] = rv[x[key]] || []).push(x);
                return rv;
            }, {});
        };
        let groupedResult = groupBy(diagnostics, 'file');
        console.log(groupedResult);
        return groupedResult;
    }
}
exports.DiagnosticManipulator = DiagnosticManipulator;


/***/ }),
/* 9 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DiagnosticController = void 0;
const vscode = __webpack_require__(1);
const diagnosticManipulator_1 = __webpack_require__(8);
class DiagnosticController {
    constructor(diagnosticCollection) {
        this.diagnosticCollection = diagnosticCollection;
        this.diagnosticManipulator = new diagnosticManipulator_1.DiagnosticManipulator();
    }
    addDiagnostics(diagniostics) {
        let distinctDiagnosticsPerFile = this.diagnosticManipulator.manipulate(diagniostics);
        for (const file in distinctDiagnosticsPerFile) {
            if (!this.checkFile(file, distinctDiagnosticsPerFile)) {
                break;
            }
            let vsDiagnostics = this.map(distinctDiagnosticsPerFile, file);
            this.add(file, vsDiagnostics);
        }
    }
    checkFile(file, distinctDiagnosticsPerFile) {
        if (distinctDiagnosticsPerFile.hasOwnProperty(file)) {
            console.log(`ERROR: distinctDiagnosticsPerFile kennt die File ${file} nicht!`);
            return true;
        }
        return false;
    }
    map(myDiagnostics, file) {
        let vsDiagnostics = Array();
        myDiagnostics[file].forEach(diagnostic => {
            vsDiagnostics.push(new vscode.Diagnostic(diagnostic.range, diagnostic.message, diagnostic.severity));
        });
        return vsDiagnostics;
    }
    add(file, vsDiagnostics) {
        this.diagnosticCollection.set(vscode.Uri.file(file), vsDiagnostics);
    }
}
exports.DiagnosticController = DiagnosticController;


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
    let diagnosticCollection = vscode.languages.createDiagnosticCollection('fsh');
    let runSushiSubscription = vscode.commands.registerCommand('codfsh.runSushi', () => {
        let sushiController = new sushiController_1.SushiController(diagnosticCollection);
        sushiController.execute();
    });
    let runHapiSubscription = vscode.commands.registerCommand('codfsh.runHapi', () => {
        //let hapiController = new HapiController();
        //	hapiController.execute();
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