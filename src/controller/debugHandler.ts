import * as vscode from 'vscode';

export class DebugHandler {
    private output: vscode.OutputChannel;

    constructor() {
        this.output = vscode.window.createOutputChannel("codfsh: Info");
        this.output.clear();
    }

    public log(severity: string, message: string, escalateToUser = false): void {
        this.output.appendLine(`[${severity.toUpperCase()}]\t${message}`);

        if (severity.toLowerCase() === "error") {
            escalateToUser && vscode.window.showErrorMessage(message);
            this.output.show();
            console.error(message);
        } else {
            escalateToUser && vscode.window.showInformationMessage(message);
            console.log(message);
        }
    }
}
