import * as vscode from 'vscode';
import { FirelyWrapper } from './firelyWrapper';
import { DiagnosticController } from '../diagnosticController';
import { FirelyOutputParser } from './firelyOutputParser';
import { DebugHandler } from '../debugHandler';
import { PathController } from '../pathController';
import { Diagnostic } from '../../models/diagnostic';
import { ProcessController } from '../processController';

export class FirelyController {
    debugHandler: DebugHandler;
    pathController: PathController;
    processController: ProcessController;
    diagnosticController: DiagnosticController;
    firelyWrapper: FirelyWrapper;
    firelyOutputParser: FirelyOutputParser;

    constructor(debugHandler: DebugHandler, diagnosticCollection: vscode.DiagnosticCollection) {
        this.debugHandler = debugHandler;
        this.pathController = new PathController(debugHandler);
        this.processController = new ProcessController(debugHandler);
        this.diagnosticController = new DiagnosticController(debugHandler, diagnosticCollection);
        this.firelyWrapper = new FirelyWrapper(debugHandler, this.pathController, this.processController);
        this.firelyOutputParser = new FirelyOutputParser(debugHandler);
    }

    public async executeAll() {
        this.debugHandler.log("info", "Running Firely Terminal Validation...", true);
    
        const pathValues = await this.pathController.getPathVariables();
    
        this.debugHandler.log("info", `Found sushiConfigPath: ${pathValues.sushiConfigPath}`, true);
        this.debugHandler.log("info", `Found resourceFolder: ${pathValues.ressourceFolderPath}`, true);
    
        const validationOutputs = await this.firelyWrapper.validateAll(pathValues.ressourceFolderPath);
        const diagnostics: Diagnostic[] = [];
    
        for (const { output, file } of validationOutputs) {
            this.debugHandler.log("info", `Parsing validation output for ${file}`, false);
            const parsed = this.firelyOutputParser.getDiagnostics(output, file);
            diagnostics.push(...parsed);
        }
    
        this.diagnosticController.addDiagnostics(diagnostics);
        this.debugHandler.log("info", "Firely Validation complete.", true);
    }
}