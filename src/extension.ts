import * as vscode from 'vscode';
import { SushiController } from './controller/sushi/sushiController';
import { HapiController } from './controller/hapi/hapiController';
import { DebugHandler } from './controller/debugHandler';

export function activate(context: vscode.ExtensionContext) {
    let debugHandler = new DebugHandler();
    debugHandler.log("info", "Extension started");

    try {
        let diagnosticCollection = vscode.languages.createDiagnosticCollection('fsh');
        let controllers = createControllers(debugHandler, diagnosticCollection);
        createSubscriptions(context, diagnosticCollection, controllers);
    } catch (e: any) {
        handleError(debugHandler, e);
    }
}

function createControllers(debugHandler: DebugHandler, diagnosticCollection: vscode.DiagnosticCollection) {
    let sushiController = new SushiController(debugHandler, diagnosticCollection);
    let hapiController = new HapiController(debugHandler, diagnosticCollection);

    return { sushiController, hapiController };
}

function createSubscriptions(context: vscode.ExtensionContext, diagnosticCollection: vscode.DiagnosticCollection, controllers: { sushiController: SushiController, hapiController: HapiController }) {
    let runSushiSubscription = vscode.commands.registerCommand('codfsh.runSushi', () => {
        diagnosticCollection.clear();
        controllers.sushiController.execute();
    });

    let runHapiSubscription = vscode.commands.registerCommand('codfsh.runHapi', () => {
        diagnosticCollection.clear();
        controllers.hapiController.executeForCurrentFile();
    });

    let runFhirFshSubscription = vscode.commands.registerCommand('codfsh.runAll', async () => {
        diagnosticCollection.clear();
        await controllers.sushiController.execute();
        await controllers.hapiController.executeAll();
    });

    context.subscriptions.push(runSushiSubscription);
    context.subscriptions.push(runHapiSubscription);
    context.subscriptions.push(runFhirFshSubscription);
}

function handleError(debugHandler: DebugHandler, e: any) {
    if (typeof e === "string") {
        debugHandler.log("error", e, true);
    } else if (e instanceof Error) {
        debugHandler.log("error", e.message, true);
    }
}

export function deactivate() { }
