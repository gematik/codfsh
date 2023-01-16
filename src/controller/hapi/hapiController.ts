import * as vscode from 'vscode';
import { DiagnosticController } from '../diagnosticController';
import { HapiWrapper } from './hapiWrapper';
import { HapiOutputParser } from './hapiOutputParser';
import { ConfigHandler } from '../configHandler';
import { FileConnector } from './fileConnector';
import { ErrorHandler } from '../errorHandler';
import { NotificationController } from '../notificationController';
import { ValidationResult } from '../../models/validationResult';
import { PathController } from '../pathController';
import { DebugHandler } from '../debugHandler';
import { DependencyController } from '../dependencyController';
import { PathValues } from '../../models/pathValues';
const url = require('url');


export class HapiController{
    debugHandler : DebugHandler;
    dependencyController: DependencyController;
    hapiWrapper : HapiWrapper;
    diagnosticController : DiagnosticController;
    hapiOutputParser : HapiOutputParser;
    configHandler: ConfigHandler;
    pathController: PathController;
    fileConnector: FileConnector;
    errorHandler: ErrorHandler;
    notificationController: NotificationController;

    constructor(debugHandler : DebugHandler, diagnosticCollection: vscode.DiagnosticCollection){
        this.debugHandler = debugHandler;
        this.diagnosticController = new DiagnosticController(this.debugHandler, diagnosticCollection);
        this.configHandler = new ConfigHandler(this.debugHandler);
        this.pathController = new PathController(this.debugHandler);
        this.dependencyController = new DependencyController(this.debugHandler, this.pathController);
        this.hapiWrapper = new HapiWrapper(this.debugHandler, this.configHandler);
        this.hapiOutputParser = new HapiOutputParser(this.debugHandler);
        this.fileConnector = new FileConnector(this.debugHandler);
        this.errorHandler = new ErrorHandler(this.debugHandler);
        this.notificationController = new NotificationController(this.debugHandler);
    }

    public async execute() {
        try {
            var currentFileUri = vscode.window.activeTextEditor?.document.uri;
            if (currentFileUri) {
                const currentFilePath = currentFileUri.fsPath;
                const pathValues =  await this.pathController.getPathVariables();
                this.debugHandler.log("info", "Current file is :'" + currentFilePath + "'");
                let filesForValidation = this.fileConnector.identifyGeneratedRessources(currentFileUri,pathValues.ressourceFolderPath);
                this.validate(pathValues, filesForValidation);
            }
        } catch (e: any) {
            this.debugHandler.log("error", e, true);
        }
    }

    private async validate(pathValues: PathValues, filesForValidation: string[]) {
        this.notificationController.notifyStarted(filesForValidation);
        const dependencyList = await this.dependencyController.getDependenciesAsIgList(pathValues);
        const consoleOutput = await this.hapiWrapper.getConsoleOutput(filesForValidation, dependencyList);
        this.processValidationResults(consoleOutput, filesForValidation.length);

    }

    private processValidationResults(consoleOutput: string, numberOfFiles: number) {
        var validationResults = this.hapiOutputParser.getValidationResults(consoleOutput, numberOfFiles);
        this.diagnosticController.clearDiagnosticCollection();
        validationResults.forEach((result : ValidationResult) => {
            this.diagnosticController.addDiagnostics(result.diagnostics);
            this.notificationController.notifyCompleted(result.file + " " + result.summary);
        });
    }
}