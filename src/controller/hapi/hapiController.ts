import * as vscode from 'vscode';
import { DiagnosticController } from '../diagnosticController';
import { HapiWrapper } from './hapiWrapper';
import { HapiOutputParser } from './hapiOutputParser';
import { ConfigHandler } from '../configHandler';
import { FileConnector } from './fileConnector';
import { ErrorHandler } from '../errorHandler';
import { NotificationController } from '../notificationController';
import { ValidationResult } from '../../models/validationResult';


export class HapiController{
    hapiWrapper : HapiWrapper;
    diagnosticController : DiagnosticController;
    hapiOutputParser : HapiOutputParser;
    configHandler: ConfigHandler;
    fileConnector: FileConnector;
    errorHandler: ErrorHandler;
    notificationController: NotificationController;

    constructor(diagnosticCollection: vscode.DiagnosticCollection){
        this.configHandler = new ConfigHandler();
        this.hapiWrapper = new HapiWrapper(this.configHandler);
        this.diagnosticController = new DiagnosticController(diagnosticCollection);
        this.hapiOutputParser = new HapiOutputParser();
        this.fileConnector = new FileConnector(this.configHandler);
        this.errorHandler = new ErrorHandler();
        this.notificationController = new NotificationController();
    }

    public execute() {
        this.diagnosticController.clearDiagnosticCollection();
        var currentFile = vscode.window.activeTextEditor?.document.uri;
        if (currentFile) {
            let filesForValidation = this.fileConnector.identifyGeneratedRessources(currentFile);
            this.validate(filesForValidation);
        }
    }

    private validate(filesForValidation: string[]) {
        this.notificationController.notifyStarted(filesForValidation);
        this.hapiWrapper.getConsoleOutput(filesForValidation)
            .then((consoleOutput: string) => {
                this.processValidationResults(consoleOutput);
            }).catch((error) => {
                this.errorHandler.handleError(error);
            });
    }

    private processValidationResults(consoleOutput: string) {
        var validationResults = this.hapiOutputParser.getValidationResults(consoleOutput);
        validationResults.forEach((result : ValidationResult) => {
            this.diagnosticController.addDiagnostics(result.diagnostics);
            this.notificationController.notifyCompleted(result.file + " " + result.summary);
        });

    }
}





