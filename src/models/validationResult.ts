import { Diagnostic } from "./diagnostic";

export class ValidationResult {
    file : string;
    summary : string;
    text: string;
    diagnostics : Diagnostic[];

    constructor(file: string, summary: string, text: string){
        this.file = file;
        this.summary = summary;
        this.text = text;
        this.diagnostics = [];
    }

    public addDiagnostic(diagnostic:Diagnostic ){
        this.diagnostics.push(diagnostic);
    }

    public setDiagnostics(diagnostics:Diagnostic[] ){
        this.diagnostics = diagnostics;
    }
}