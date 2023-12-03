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
        private notificationController = new NotificationController(debugHandler),
        private localConfigPath: string = "",
        private isLocalProjectSettingsFileActive: boolean = false
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
        const validatorDestination = this.configHandler.getFilePathFromConfig("HapiValidator.Executable");
        this.notificationController.notifyStarted(filesForValidation);
        const dependencyList = await this.dependencyController.getDependenciesAsIgList(pathValues);
        let validatorConfig = this.configHandler.getHapiParametersFromExtensionConfig();
    
        this.isLocalProjectSettingsFileActive = this.configHandler.isLocalProjectSettingsFileActive();
    
        if (this.isLocalProjectSettingsFileActive) {
            this.localConfigPath = await this.pathController.tryGetConfigPath("codfsh-config.yaml");
            if (this.localConfigPath !== "") {
                this.debugHandler.log("info", `Reading Hapi Parameter and Configuration from '${this.localConfigPath}'`);
                this.isValidatorVersionValid(validatorDestination, this.localConfigPath);
                const validatorLocalParameterConfig = this.configHandler.getParametersFromLocalSettingsFile(this.localConfigPath, "hapi");

                validatorConfig = { ...validatorConfig, ...validatorLocalParameterConfig };
            }
        }
    
        const consoleOutput = await this.hapiWrapper.getConsoleOutput(validatorDestination, filesForValidation, dependencyList, validatorConfig);
        this.processValidationResults(consoleOutput, filesForValidation.length);
    }

    private async isValidatorVersionValid(validatorDestination: string, localConfigPath: string) {
        // Check if the validator version is above the required version
        const validatorVersion = await this.hapiWrapper.getValidatorVersion(validatorDestination);
        const minVersion = this.configHandler.getMinVersion(false, localConfigPath, "hapi");
        if (this.compareVersions(validatorVersion, minVersion) < 0) {
            this.debugHandler.log("error", `Validator version is ${validatorVersion}, which is below the minimum required version ${minVersion}.`, true);
            return;
        }
    }

    private compareVersions(v1: string, v2: string): number {
        const parts1 = v1.split('.').map(Number);
        const parts2 = v2.split('.').map(Number);
        for (let i = 0; i < parts1.length && i < parts2.length; i++) {
            if (parts1[i] > parts2[i]) {return 1;}
            if (parts1[i] < parts2[i]) {return -1;}
        }
        if (parts1.length > parts2.length) {return 1;}
        if (parts1.length < parts2.length) {return -1;}
        return 0;
    }
    
    private async processValidationResults(consoleOutput: string, numberOfFiles: number) {
        var validationResults = this.hapiOutputParser.getValidationResults(consoleOutput, numberOfFiles);
        
        if (this.isLocalProjectSettingsFileActive && this.localConfigPath !== "") {
            this.debugHandler.log("info", `Reading Hapi Parameter from '${this.localConfigPath}'`);
            //TODO: also read the global config file for ignoring of diagnostics
            let ignoredDiagnostics = this.configHandler.getIgnoredDiagnosticsFromSettingsFile(this.localConfigPath, "hapi");
            validationResults.forEach((result: ValidationResult) => {
                // Filter out ignored diagnostics
                const validDiagnostics = result.diagnostics.filter(diagnostic => {
                    const diagnosticSeverity = vscode.DiagnosticSeverity[diagnostic.severity].toLowerCase();
                        if(diagnosticSeverity in ignoredDiagnostics) {
                        const ignoredDiagnosticTexts = ignoredDiagnostics[diagnosticSeverity];
                        // Extract the message part after the pipe character
                        const messageParts = diagnostic.message.split(" | ");
                        // If there is no part after the pipe character, do not ignore the diagnostic
                        if (messageParts.length <= 1) {
                            return true;
                        }
                        const diagnosticMessage = messageParts[1].trim();
                        // Check if the diagnostic's message is in the ignoredDiagnosticTexts
                        if (ignoredDiagnosticTexts && ignoredDiagnosticTexts.includes(diagnosticMessage)) {
                            this.debugHandler.log("info", "Ignoring message: '" + diagnosticMessage + "'");
                            return false;
                        } else {
                            return true;
                        }
                    } else {
                        return true;
                    }
                    
                });
    
                // Only add valid diagnostics
                if(validDiagnostics.length > 0) {
                    this.diagnosticController.addDiagnostics(validDiagnostics);
                }
            });
        } else {
            validationResults.forEach((result: ValidationResult) => {
                this.diagnosticController.addDiagnostics(result.diagnostics);
            });
        }
    }
    
}