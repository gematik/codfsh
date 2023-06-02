import * as vscode from 'vscode';
import { DebugHandler } from './debugHandler';

export class ErrorHandler {
    debugHandler: DebugHandler;

    constructor(debugHandler: DebugHandler) {
        this.debugHandler = debugHandler;
    }

    public handleError(error: any) {
        vscode.window
            .showErrorMessage(error, 'Ok', 'Resolve')
            .then(selection => {
                if (selection === 'Resolve') {
                    this.resolveError(error);
                } else {
                    this.debugHandler.log('info', 'Error dismissed.');
                }
            });
    }

    private resolveError(error: any) {
        // TODO: Implement error resolution logic
        this.debugHandler.log('info', `Resolving error: ${error}`);
    }
}
