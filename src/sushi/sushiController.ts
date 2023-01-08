import * as vscode from 'vscode';
import { SushiWrapper } from './sushiWrapper';
import { DiagnosticController } from '../controller/diagnosticController';
import { SushiOutputParser } from './sushiOutputParser';

export class SushiController{
    sushiWrapper : SushiWrapper;
    diagnosticController : DiagnosticController;    
    sushiOutputParser : SushiOutputParser;

    constructor(diagnosticCollection: vscode.DiagnosticCollection){
        this.sushiWrapper = new SushiWrapper();
        this.diagnosticController = new DiagnosticController(diagnosticCollection);
        this.sushiOutputParser = new SushiOutputParser();
    }
   
    public execute() {
        var currentFile = vscode.window.activeTextEditor?.document.uri;
        if (currentFile) {
            vscode.window.showInformationMessage('Running Sushi...');
            this.sushiWrapper.getConsoleOutput(currentFile.path)
                .then((consoleOutput : string) => {
                    var diagnostics = this.sushiOutputParser.getDiagnostics(consoleOutput);
                    this.diagnosticController.addDiagnostics(diagnostics); 
                    vscode.window.showInformationMessage('Sushi Completed.');
                }).catch((error) => {
                    console.log(error);
                    vscode.window.showErrorMessage(error);
                });
        }
    }
}





