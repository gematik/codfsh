import { DiagnosticSeverity, Range } from "vscode";
import { Diagnostic } from "../../models/diagnostic";
import { ValidationResult } from "../../models/validationResult";
import { DebugHandler } from "../debugHandler";

export class HapiOutputParser{

    debugHandler : DebugHandler;

    constructor(debugHandler : DebugHandler){
        this.debugHandler = debugHandler;
    }

    public getValidationResults(logOutput: string): ValidationResult[]{
        const files = this.getFilesValidated(logOutput);

        let validationResults : ValidationResult[] = [];
        files.forEach(validationResult => {
            let diagnostics = this.parseFileDetails(validationResult.text, validationResult.file);
            validationResult.setDiagnostics(diagnostics);
            console.log("Found " + validationResult.diagnostics.length + " Diagnostics in File " + validationResult.file);
            validationResults.push(validationResult);
        });
        return validationResults;
    }

    getFilesValidated(logOutput: string) : ValidationResult[]{
        const regex = /-- (?<filename>.*) -+\n(?<summary>.*)\n(?<text>(.+\n)*)-{10,}/gm;
        let m;
        let files : ValidationResult[] = [];
        while ((m = regex.exec(logOutput)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            if (m.groups?.filename) {
                files.push(new ValidationResult(m.groups.filename,m.groups?.summary,m.groups?.text));
            }
        }
        return files;
    }

    private parseFileDetails(logOutput: string, fileValidated: string): Diagnostic[] {
        const regex = /(\s\s((?<severity>\w+)\s@\s(?<path>.*)\s(\(line\s(?<line_from>\d+).\scol(?<col_from>\d+)\))?:\s(?<message>.*))\n)/gm;
        let m;
        let output : Diagnostic[] = [];

        while ((m = regex.exec(logOutput)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            var severityType = DiagnosticSeverity.Error;
            if (m.groups?.severity === "warn") {
                severityType = DiagnosticSeverity.Warning;
            }

            if (m.groups?.message) {
                var lineFrom: number = +(m.groups?.line_from) - 1;
                var colFrom: number = 0;
                if (m.groups?.col_from) {
                    colFrom = +(m.groups?.col_from) - 1;
                }
                output.push(new Diagnostic(severityType, m.groups?.path + " | " + m.groups?.message, fileValidated, new Range(lineFrom, colFrom, lineFrom, 200)));
            }
        }
        return output;
    }
}