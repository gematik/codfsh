import * as vscode from 'vscode';
import { SushiController } from './controller/sushi/sushiController';
import { HapiController } from './controller/hapi/hapiController';
import { DebugHandler } from './controller/debugHandler';


export function activate(context: vscode.ExtensionContext) {
	let debugHandler = new DebugHandler();
	debugHandler.log("info","Extension started");

	try {
		let diagnosticCollection = vscode.languages.createDiagnosticCollection('fsh');
		let sushiController = new SushiController(debugHandler, diagnosticCollection);
		let hapiController = new HapiController(debugHandler, diagnosticCollection);

		let runSushiSubscription = vscode.commands.registerCommand('codfsh.runSushi', () => {
			debugHandler.log("info","Executing Sushi");
			sushiController.execute();
		});

		let runHapiSubscription = vscode.commands.registerCommand('codfsh.runHapi', () => {
			debugHandler.log("info","Executing Hapi");
			hapiController.execute();
		});

		let runFhirFshSubscription = vscode.commands.registerCommand('codfsh.runFhirFsh', () => {
			debugHandler.log("info","Executing Sushi and Hapi");
			vscode.window.showInformationMessage('Running Sushi and Hapi!');
		});

		context.subscriptions.push(runSushiSubscription);
		context.subscriptions.push(runHapiSubscription);
		context.subscriptions.push(runFhirFshSubscription);
	}
	catch(e:any){
		if (typeof e === "string") {
			debugHandler.log("error",e);
		} else if (e instanceof Error) {
			debugHandler.log("error",e.message);
			vscode.window.showErrorMessage(e.message);
		}
		
	}
}


export function deactivate() {}
