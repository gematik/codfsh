import * as vscode from 'vscode';
import { DiagnosticController } from '../diagnosticController';
import { HapiWrapper } from './hapiWrapper';
import { HapiOutputParser } from './hapiOutputParser';
import { ConfigHandler } from '../configHandler';
import { DependencyController } from '../dependencyController';
import { FileConnector } from './fileConnector';
var path = require("path");


export class HapiController{
    hapiWrapper : HapiWrapper;
    diagnosticController : DiagnosticController;    
    hapiOutputParser : HapiOutputParser;
    configHandler: ConfigHandler;
    dependencyController: DependencyController;
    fileConnector: FileConnector;

    constructor(diagnosticCollection: vscode.DiagnosticCollection){
        this.configHandler = new ConfigHandler();

        this.dependencyController = new DependencyController(
            this.configHandler.getFilePathFromConfig("HapiValidator.sushi-config.destination"));

        this.hapiWrapper = new HapiWrapper(
            this.configHandler.getFilePathFromConfig("HapiValidator.Executable"),
            this.dependencyController.parseDependencies(),
            this.configHandler.getProxySettings("HapiValidator.Proxy"));

        this.diagnosticController = new DiagnosticController(diagnosticCollection);

        this.hapiOutputParser = new HapiOutputParser();

        this.fileConnector = new FileConnector(this.configHandler.getFilePathFromConfig("RessourcesFolder"));
    }

    public download() {
        throw new Error('Method not implemented.');
        //wget https://github.com/hapifhir/org.hl7.fhir.core/releases/download/5.6.89/validator_cli.jar -O ~\.fhir\validators\validator_cli_v5.6.89.jar
    }
   
    public execute() {
        var currentFile = vscode.window.activeTextEditor?.document.uri;
        if (currentFile) {
            let filestoValidate = this.fileConnector.identifyGeneratedRessources(currentFile);
            filestoValidate.forEach((fileToValidate) => {
                vscode.window.showInformationMessage("Running Hapi for '" + path.basename(fileToValidate) + "'...");
                this.hapiWrapper.getConsoleOutput(fileToValidate)
                    .then((consoleOutput : string) => {
                        var diagnostics = this.hapiOutputParser.getDiagnostics(consoleOutput, fileToValidate);
                        this.diagnosticController.addDiagnostics(diagnostics); 
                        vscode.window.showInformationMessage("Hapi completed for '" + path.basename(fileToValidate) + "'...");
                    }).catch((error) => {
                        //console.log(error);
                        vscode.window.showErrorMessage(error);
                    });
            });
        }
    }
}





