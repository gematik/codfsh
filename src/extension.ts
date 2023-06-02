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
        	diagnosticCollection.clear();
			sushiController.execute();
		});

		let runHapiSubscription = vscode.commands.registerCommand('codfsh.runHapi', () => {
			diagnosticCollection.clear();
			hapiController.executeForCurrentFile();
		});

		let runFhirFshSubscription = vscode.commands.registerCommand('codfsh.runAll', async () => {
			diagnosticCollection.clear();
			await sushiController.execute();
			await hapiController.executeAll();
		});

		context.subscriptions.push(runSushiSubscription);
		context.subscriptions.push(runHapiSubscription);
		context.subscriptions.push(runFhirFshSubscription);
	}
	catch(e:any){
		if (typeof e === "string") {
			debugHandler.log("error",e, true);
		} else if (e instanceof Error) {
			debugHandler.log("error",e.message, true);
		}

	}
}


export function deactivate() {}
