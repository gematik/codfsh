"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const activateFshDebug_1 = require("./activateFshDebug");
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
function activate(context) {
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('fsh-validator.runFhirFsh', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hallo Robert, jetzt VALIDATE_ALL!');
    });
    context.subscriptions.push(disposable);
    (0, activateFshDebug_1.activateMockDebug)(context);
}
exports.activate = activate;
// This method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map