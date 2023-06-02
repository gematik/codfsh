import * as vscode from 'vscode';
import { SushiWrapper } from './sushiWrapper';
import { DiagnosticController } from '../diagnosticController';
import { SushiOutputParser } from './sushiOutputParser';
import path = require("path");
import { DebugHandler } from '../debugHandler';
import { PathController } from '../pathController';
import { Diagnostic } from '../../models/diagnostic';
import { ConfigHandler } from '../configHandler';
import { DependencyEnsurer } from '../dependencyEnsurer';
import { ProcessController } from '../processController';
import { DependencyController } from '../dependencyController';

export class SushiController{
    debugHandler : DebugHandler;
    sushiWrapper : SushiWrapper;
    configHandler: ConfigHandler;
    diagnosticController : DiagnosticController;
    sushiOutputParser : SushiOutputParser;
    pathController: PathController;
    processController : ProcessController;
    dependencyController: DependencyController;
    dependencyEnsurer : DependencyEnsurer;


    constructor(debugHandler : DebugHandler, diagnosticCollection: vscode.DiagnosticCollection){
        this.debugHandler = debugHandler;
        this.pathController = new PathController(this.debugHandler);
        this.configHandler = new ConfigHandler(this.debugHandler);
        this.processController = new ProcessController(this.debugHandler);
        this.sushiWrapper = new SushiWrapper(this.debugHandler, this.pathController, this.configHandler, this.processController);
        this.diagnosticController = new DiagnosticController(this.debugHandler, diagnosticCollection);
        this.sushiOutputParser = new SushiOutputParser(this.debugHandler);
        this.dependencyController = new DependencyController(this.debugHandler, this.pathController);
        this.dependencyEnsurer = new DependencyEnsurer(this.debugHandler, this.processController);
    }

    public async execute() {
        try {
            await this.checkDependencies();
            await this.runSushi();

        } catch (error: any)  {
            this.debugHandler.log("error", error, true);
        }
    }

    async checkDependencies() {
        this.debugHandler.log("info", "Checking FHIR Packages Dependencies...", true);
        const pathValues =  await this.pathController.getPathVariables();
        const neededDependencies = this.dependencyController.parseDependencies(pathValues.sushiConfigPath);
        await this.dependencyEnsurer.installMissingDependencies(neededDependencies);
        this.debugHandler.log("info", "All FHIR Packages Dependencies checked.", true);
    }

    private async runSushi() {
        this.debugHandler.log("info", "Started Sushi...", true);
        const consoleOutput = await this.getConsoleOutput();
        var diagnostics = this.sushiOutputParser.getDiagnostics(consoleOutput);
        this.addDiagnostics(diagnostics);
        this.debugHandler.log("info", "Sushi completed.", true);
    }

    private addDiagnostics(diagnostics: Diagnostic[]) {
        this.diagnosticController.addDiagnostics(diagnostics);
    }

    private async getConsoleOutput() {
        const pathValues = await this.pathController.getPathVariables();
        const consoleOutput = await this.sushiWrapper.getConsoleOutput(pathValues.ressourceFolderPath);
        return consoleOutput;
    }
}