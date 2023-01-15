import * as vscode from 'vscode';
import { SushiWrapper } from './sushiWrapper';
import { DiagnosticController } from '../diagnosticController';
import { SushiOutputParser } from './sushiOutputParser';
import path = require("path");
import { DebugHandler } from '../debugHandler';
import { PathController } from '../pathController';
import { PathValues } from '../../models/pathValues';
import { Diagnostic } from '../../models/diagnostic';

export class SushiController{
    debugHandler : DebugHandler;
    sushiWrapper : SushiWrapper;
    diagnosticController : DiagnosticController;
    sushiOutputParser : SushiOutputParser;
    pathController: PathController;

    constructor(debugHandler : DebugHandler, diagnosticCollection: vscode.DiagnosticCollection){
        this.debugHandler = debugHandler;
        this.pathController = new PathController(this.debugHandler);
        this.sushiWrapper = new SushiWrapper(this.debugHandler, this.pathController);
        this.diagnosticController = new DiagnosticController(this.debugHandler, diagnosticCollection);
        this.sushiOutputParser = new SushiOutputParser(this.debugHandler);
    }

    public async execute() {
        try {
            this.debugHandler.log("info", "Running Sushi...", true);
            const consoleOutput = await this.getConsoleOuput();
            var diagnostics = this.sushiOutputParser.getDiagnostics(consoleOutput);
            this.addDiagnistics(diagnostics);
            this.debugHandler.log("info", "Sushi completed.", true);

        } catch (error: any)  {
            this.debugHandler.log("error", error, true);
        }
    }

    private addDiagnistics(diagnostics: Diagnostic[]) {
        this.diagnosticController.clearDiagnosticCollection();
        this.diagnosticController.addDiagnostics(diagnostics);
    }

    private async getConsoleOuput() {
        const pathValues = await this.pathController.getPathVariables();
        const consoleOutput = await this.sushiWrapper.getConsoleOutput(pathValues.ressourceFolderPath);
        return consoleOutput;
    }
}





