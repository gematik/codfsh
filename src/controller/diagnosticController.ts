import * as vscode from 'vscode';
import { Diagnostic } from "../models/diagnostic";
import { DiagnosticManipulator } from "./diagnosticManipulator";
import { DebugHandler } from './debugHandler';

export class DiagnosticController{
    private debugHandler : DebugHandler;
    private diagnosticManipulator : DiagnosticManipulator;
    private diagnosticCollection: vscode.DiagnosticCollection;

    constructor(debugHandler : DebugHandler, diagnosticCollection: vscode.DiagnosticCollection) {
        this.debugHandler = debugHandler;
        this.diagnosticCollection = diagnosticCollection;
        this.diagnosticManipulator = new DiagnosticManipulator();
    }

    public addDiagnostics(diagnostics: Diagnostic[]): void {
        const distinctDiagnosticsPerFile = this.diagnosticManipulator.manipulate(diagnostics);
        for (const file in distinctDiagnosticsPerFile) {
            if (!this.fileExistsIn(file, distinctDiagnosticsPerFile)){
                continue;
            }
            const vsDiagnostics = this.mapDiagnostics(distinctDiagnosticsPerFile, file);
            this.addToCollection(file, vsDiagnostics);
        }
    }

    private fileExistsIn(file: string, distinctDiagnosticsPerFile: Record<string, Diagnostic[]>): boolean {
        if (!distinctDiagnosticsPerFile.hasOwnProperty(file)) {
            this.debugHandler.log("error", `ERROR: distinctDiagnosticsPerFile does not know the file ${file}!`);
            return false;
        }
        return true;
    }

    private mapDiagnostics(myDiagnostics: Record<string, Diagnostic[]>, file: string): vscode.Diagnostic[] {
        return myDiagnostics[file].map(diagnostic => 
            new vscode.Diagnostic(diagnostic.range, diagnostic.message, diagnostic.severity)
        );
    }

    private addToCollection(file: string, vsDiagnostics: vscode.Diagnostic[]): void {
        this.diagnosticCollection.set(vscode.Uri.file(file), vsDiagnostics);
    }
}
