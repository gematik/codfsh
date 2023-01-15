import * as vscode from 'vscode';


export class DebugHandler {

    output : vscode.OutputChannel;

    constructor(){
        this.output = vscode.window.createOutputChannel("codfsh debug");
        this.output.clear();
    }

    log(severity: string, message: string, escalateToUser: boolean = false) {
        this.output.appendLine(`[${severity.toUpperCase()}]\t${message}`);
        if (severity.toLowerCase() === "error") {
            if (escalateToUser) {
                vscode.window.showErrorMessage(message);
            }
            this.output.show();
            console.error(message);
        }
        else{
            if (escalateToUser) {
                vscode.window.showInformationMessage(message);
            }
            console.log(message);
        }
    }
}