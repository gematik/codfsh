import { DiagnosticSeverity, Range } from "vscode";
import { Diagnostic } from "../../models/diagnostic";
import { ValidationResult } from "../../models/validationResult";
import { DebugHandler } from "../debugHandler";

export class HapiOutputParser{

    debugHandler : DebugHandler;

    constructor(debugHandler : DebugHandler){
        this.debugHandler = debugHandler;
    }

    public getValidationResults(logOutput: string, numberOfFiles: number): ValidationResult[]{
        const files = this.getFilesValidated(logOutput, numberOfFiles);

        let validationResults : ValidationResult[] = [];
        files.forEach(validationResult => {
            let diagnostics = this.parseFileDetails(validationResult.text, validationResult.file);
            validationResult.setDiagnostics(diagnostics);
            this.logFileDetails(validationResult);
            validationResults.push(validationResult);
        });
        this.debugHandler.log("info", "Added diagnostics for " + validationResults.length + " file(s).");
        return validationResults;
    }

    private logFileDetails(validationResult: ValidationResult) {

        let errors = this.getCountForSeverity(validationResult, DiagnosticSeverity.Error);
        let warnings = this.getCountForSeverity(validationResult, DiagnosticSeverity.Warning);
        let notes = this.getCountForSeverity(validationResult, DiagnosticSeverity.Information);
        this.debugHandler.log("info", `Found ${validationResult.diagnostics.length} (${errors}|${warnings}|${notes}) diagnostics in file ${validationResult.file}`);
    }

    private getCountForSeverity(validationResult: ValidationResult, searchSeverity: DiagnosticSeverity) {
        return validationResult.diagnostics.filter(d => d.severity === searchSeverity).length;
    }

    getFilesValidated(logOutput: string, numberOfFiles: number) : ValidationResult[]{
        let regex= /(\n\s\sValidate\s(?<filename>.*)\n)(.|\n)*\*(?<summary>\w+\*\:.*)\n(?<text>(.|\n)+)/gm;

        if (numberOfFiles>1){
            regex = /-- (?<filename>.*) -+\n(?<summary>.*)\n\s+(?<text>((.|\n))+?)-{2,}/gm;
        }

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
        const regex = /((?<severity>\w+)\s@\s(?<path>.+?)(\s\(line\s(?<line_from>\d+).\scol(?<col_from>\d+)\))?:\s(?<message>.*))/gm;
        let m;
        let output : Diagnostic[] = [];

        while ((m = regex.exec(logOutput)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            if (m.groups?.message) {
                let severity = this.setSeverity(m);
                let range = this.setRange(m);
                output.push(new Diagnostic(severity, m.groups?.path + " | " + m.groups?.message, fileValidated,range ));
            }
        }
        return output;
    }

    private setRange(m: RegExpExecArray) : Range {
        var lineFrom: number = 0;
        var colFrom: number = 0;
        if (m.groups?.col_from) {
            lineFrom = +(m.groups?.line_from) - 1;
        }
        if (m.groups?.col_from) {
            colFrom = +(m.groups?.col_from) - 1;
        }

        return new Range(lineFrom, colFrom, lineFrom, 200);
    }

    private setSeverity(m: RegExpExecArray) {
        let severityType = DiagnosticSeverity.Error;
        if(m.groups?.severity) {
            if (["warn", "Warning"].includes(m.groups.severity)) {
                severityType = DiagnosticSeverity.Warning;
            }
            else if (["Information"].includes(m.groups.severity)) {
                severityType = DiagnosticSeverity.Information;
            }
        }
        return severityType;
    }
}