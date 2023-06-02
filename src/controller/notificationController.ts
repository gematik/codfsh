import * as vscode from 'vscode';
import { DebugHandler } from './debugHandler';
import { Dependency } from '../models/dependency';
import * as path from 'path';

export class NotificationController {
    debugHandler: DebugHandler;

    constructor(debugHandler: DebugHandler) {
        this.debugHandler = debugHandler;
    }

    public notifyStarted(filesForValidation: string[]) {
        filesForValidation.forEach(file => {
            vscode.window.showInformationMessage("Running Hapi for '" + path.basename(file) + "'...");
        });
    }

    public notifyCompleted(fileToValidate: string) {
        vscode.window.showInformationMessage("Hapi completed for '" + path.basename(fileToValidate) + "'.", 'Open').then(selection => {
            if (selection === 'Open') {
                vscode.workspace.openTextDocument(fileToValidate).then(doc => {
                    vscode.window.showTextDocument(doc);
                });
            }
        });
    }

    public surveyInstallMissingDependency(missingDependencies: Dependency): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                vscode.window.showWarningMessage(`FHIR Package '${missingDependencies.name}#${missingDependencies.version}' is missing in local cache`, 'Install', 'Skip').then(selection => {
                    resolve(selection === 'Install');
                });
            } catch (error: any) {
                this.debugHandler.log("error", error);
                reject(error);
            }
        });
    }
}