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
import { FileHandler } from '../fileHandler';

export class HapiController {
    constructor(
        private debugHandler : DebugHandler,
        diagnosticCollection: vscode.DiagnosticCollection,
        private diagnosticController = new DiagnosticController(debugHandler, diagnosticCollection),
        private configHandler = new ConfigHandler(debugHandler),
        private fileHandler = new FileHandler(debugHandler),
        private pathController = new PathController(debugHandler),
        private dependencyController = new DependencyController(debugHandler, pathController),
        private hapiWrapper = new HapiWrapper(debugHandler, configHandler),
        private hapiOutputParser = new HapiOutputParser(debugHandler),
        private fileConnector = new FileConnector(debugHandler),
        private errorHandler = new ErrorHandler(debugHandler),
        private notificationController = new NotificationController(debugHandler)
    ) {}

    public async executeForCurrentFile() {
        try {
            var currentFileUri = vscode.window.activeTextEditor?.document.uri;
            if (currentFileUri) {
                const pathValues =  await this.pathController.getPathVariables();
                let filesForValidation = this.fileConnector.identifyGeneratedResources(currentFileUri ,pathValues.ressourceFolderPath);
                this.validate(pathValues, filesForValidation);
            }
        } catch (e: any) {
            this.debugHandler.log("error", e, true);
        }
    }

    public async executeAll() {
        try {
            const pathValues =  await this.pathController.getPathVariables();
            let fshFiles  = await this.fileHandler.getGeneratedFiles(pathValues.ressourceFolderPath);
            //let filesForValidation: string[] = this.concatGeneratedRessources(fshFiles, pathValues);
            this.validate(pathValues, fshFiles);

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
        validationResults.forEach((result : ValidationResult) => {
            this.diagnosticController.addDiagnostics(result.diagnostics);
            this.notificationController.notifyCompleted(result.file + " " + result.summary);
        });
    }
}