import * as vscode from 'vscode';
import { SushiController } from './sushi/sushiController';


export function activate(context: vscode.ExtensionContext) {
	let runSushiSubscription = vscode.commands.registerCommand('codfsh.runSushi', () => {
		let sushiController = new SushiController();
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


export function deactivate() {}
