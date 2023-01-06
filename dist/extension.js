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
        sushiWrapper.getSushiOutput();
        let range = new vscode.Range(4, 0, 4, 100);
        let d = new vscode_1.Diagnostic(range, "Testnachricht", vscode.DiagnosticSeverity.Error);
        diagnostics.push(d);
        diagnosticCollection.set(currentFile, diagnostics);
    }
    vscode.window.showInformationMessage('Running Sushi...');
}
exports.execute = execute;


/***/ }),
/* 3 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SushiWrapper = void 0;
const node_child_process_1 = __webpack_require__(4);
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
    getSushiOutput() {
        console.log("running: sushi " + this.ressourcesFolderPath);
        let buf = (0, node_child_process_1.execSync)("sushi " + this.ressourcesFolderPath);
        var sushiOutput = buf.toString();
        console.log(sushiOutput);
    }
}
exports.SushiWrapper = SushiWrapper;


/***/ }),
/* 4 */
/***/ ((module) => {

module.exports = require("node:child_process");

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