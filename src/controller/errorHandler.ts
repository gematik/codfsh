import * as vscode from 'vscode';
import { DebugHandler } from './debugHandler';


export class ErrorHandler{

    debugHandler : DebugHandler;

    constructor(debugHandler : DebugHandler){
        this.debugHandler = debugHandler;
    }

    public handleError(error: any) {
        vscode.window.showErrorMessage(error, ...['Ok', 'Resolve']).then(selection => {
            //TODO: Make specific Errors resolve able for example by downloaded missing dependencies
            console.log(selection);
        });
    }
}