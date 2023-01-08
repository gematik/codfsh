import * as vscode from 'vscode';
import { Diagnostic } from "../models/diagnostic";
import { DiagnosticManipulator } from "./diagnosticManipulator";

export class DiagnosticController{

    diagnosticManipulator : DiagnosticManipulator;
    diagnosticCollection: vscode.DiagnosticCollection;

    constructor(diagnosticCollection: vscode.DiagnosticCollection) {
        this.diagnosticCollection = diagnosticCollection;
        this.diagnosticManipulator = new DiagnosticManipulator();
    }

    public addDiagnostics(diagniostics: Diagnostic[]) {
        let distinctDiagnosticsPerFile = this.diagnosticManipulator.manipulate(diagniostics);
        for (const file in distinctDiagnosticsPerFile) {
            if (!this.checkFile(file, distinctDiagnosticsPerFile)){
                break;
            }
            let vsDiagnostics = this.map(distinctDiagnosticsPerFile, file);
            this.add(file, vsDiagnostics);
        }
    }
    
    private checkFile(file: string, distinctDiagnosticsPerFile: { [x: string]: Diagnostic[]; hasOwnProperty?: any; }): boolean {
        if (distinctDiagnosticsPerFile.hasOwnProperty(file)) {
            console.log(`ERROR: distinctDiagnosticsPerFile kennt die File ${file} nicht!`);
            return true;
        }
        return false;
    }
    
    private map(myDiagnostics: { [key: string]: Diagnostic[]; }, file: string) {
        let vsDiagnostics: Array<vscode.Diagnostic> = Array();
        myDiagnostics[file].forEach(diagnostic => {
            vsDiagnostics.push(new vscode.Diagnostic(diagnostic.range, diagnostic.message, diagnostic.severity));
        });
        return vsDiagnostics;        
    }

    private add(file: string, vsDiagnostics: vscode.Diagnostic[]) {
        this.diagnosticCollection.set(vscode.Uri.file(file), vsDiagnostics);
    }
}