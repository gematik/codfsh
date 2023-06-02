/* eslint-disable @typescript-eslint/naming-convention */
import { DiagnosticSeverity, Range } from "vscode";
import { Diagnostic } from "../../models/diagnostic";
import { ValidationResult } from "../../models/validationResult";
import { DebugHandler } from "../debugHandler";

export class HapiOutputParser{
    constructor(private debugHandler : DebugHandler){}

    public getValidationResults(logOutput: string, numberOfFiles: number): ValidationResult[]{
        const files = this.getFilesValidated(logOutput, numberOfFiles);
        return files.map(validationResult => this.parseFile(validationResult));
    }

    private parseFile(validationResult: ValidationResult): ValidationResult {
        const diagnostics = this.parseFileDetails(validationResult.text, validationResult.file);
        validationResult.setDiagnostics(diagnostics);
        this.logFileDetails(validationResult);
        return validationResult;
    }

    private countSeverity(severity: DiagnosticSeverity) {
        switch (severity) {
            case DiagnosticSeverity.Error:
                return "Error";
            case DiagnosticSeverity.Warning:
                return "Warning";
            case DiagnosticSeverity.Information:
                return "Information";
            default:
                throw new Error(`Unsupported severity level: ${severity}`);
        }
    }
    
    private getSeverityCounts(validationResult: ValidationResult) {
        const counts: Record<string, number> = { 
            "Error": 0, 
            "Warning": 0, 
            "Information": 0 
        };
        validationResult.diagnostics.forEach(d => counts[this.countSeverity(d.severity)]++);
        return counts;
    }

    private logFileDetails(validationResult: ValidationResult) {
        const severityCounts = this.getSeverityCounts(validationResult);
        this.debugHandler.log(
            "info", 
            `Found ${validationResult.diagnostics.length} (` + 
            `${severityCounts["Error"]}|` +
            `${severityCounts["Warning"]}|` +
            `${severityCounts["Information"]}) ` +
            `diagnostics in file ${validationResult.file}`
        );
    }

    getFilesValidated(logOutput: string, numberOfFiles: number) : ValidationResult[]{
        let regex= /(\n\s+Validate\s(?<filename>.*)\n)(.|\n)*\n(\*)?(?<summary>\w+(\*)?\:.*)\n(?<text>(.|\n)+)/gm;

        if (numberOfFiles > 1){
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
        if (m.groups?.line_from) {
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