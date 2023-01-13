import * as vscode from 'vscode';
import { DiagnosticController } from '../diagnosticController';
import { HapiWrapper } from './hapiWrapper';
import { HapiOutputParser } from './hapiOutputParser';
import { ConfigHandler } from '../configHandler';
import { FileConnector } from './fileConnector';
import { ErrorHandler } from '../errorHandler';
import { NotificationController } from '../notificationController';


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
        var currentFile = vscode.window.activeTextEditor?.document.uri;
        if (currentFile) {
            let filesForValidation = this.fileConnector.identifyGeneratedRessources(currentFile);
            filesForValidation.forEach((file) => {
                this.validate(file);
            });
        }
    }

    private validate(filesForValidation: string) {
        this.notificationController.notifyStarted(filesForValidation);
        this.hapiWrapper.getConsoleOutput(filesForValidation)
            .then((consoleOutput: string) => {
                this.processDiagnostics(consoleOutput, filesForValidation);
            }).catch((error) => {
                this.errorHandler.handleError(error);
            });
    }

    private processDiagnostics(consoleOutput: string, fileToValidate: string) {
        var diagnostics = this.hapiOutputParser.getDiagnostics(consoleOutput, fileToValidate);
        this.diagnosticController.addDiagnostics(diagnostics);
        this.notificationController.notifyCompleted(fileToValidate);
    }
}





