import { DiagnosticSeverity, Range } from "vscode";


export class SushiOutput {
    range: Range;
    message: string;
    file: string;
    severity: DiagnosticSeverity;

    constructor(severity: DiagnosticSeverity, message: string, file: string, range: Range){
        this.severity = severity;
        this.message = message;
        this.file = file;
        this.range = range;
    }

}