// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { activateMockDebug } from './activateFshDebug';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('fsh-validator.runFhirFsh', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hallo Robert, jetzt VALIDATE_ALL!');
	});

	context.subscriptions.push(disposable);

	activateMockDebug(context);
}

// This method is called when your extension is deactivated
export function deactivate() {}
