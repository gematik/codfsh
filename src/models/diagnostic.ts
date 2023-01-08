import { DiagnosticSeverity, Range } from "vscode";


export class Diagniostic {
    severity: DiagnosticSeverity;
    message: string;
    file: string;
    range: Range;
    lineFrom: number;
    lineTo: number;

    constructor(severity: DiagnosticSeverity, message: string, file: string, range: Range){
        this.severity = severity;
        this.message = message;
        this.file = file;
        this.range = range;
        this.lineFrom = range.start.line;
        this.lineTo = range.end.line;
    }

}