import * as vscode from 'vscode';
var path = require("path");

export class NotificationController {
    notifyStarted(filesForValidation: string) {
        return vscode.window.showInformationMessage("Running Hapi for '" + path.basename(filesForValidation) + "'...");
    }

    public notifyCompleted(fileToValidate: string) {
        vscode.window.showInformationMessage("Hapi completed for '" + path.basename(fileToValidate) + ".", 'Open').then(selection => {
            if (selection === 'Open') {
                vscode.workspace.openTextDocument(fileToValidate).then(doc => {
                    vscode.window.showTextDocument(doc);
                });
            }
        });
    }
}