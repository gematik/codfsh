import { DiagnosticSeverity, Range } from 'vscode';
import { Diagnostic } from '../../models/diagnostic';
import { DebugHandler } from '../debugHandler';
import * as path from 'path';

export class FirelyOutputParser {
    debugHandler: DebugHandler;

    constructor(debugHandler: DebugHandler) {
        this.debugHandler = debugHandler;
    }

    public getDiagnostics(logOutput: string, filePath: string): Diagnostic[] {
        const diagnostics: Diagnostic[] = [];

        // Regex sucht Blöcke wie:
        // Severity: error
        // Location: ... (optional)
        // Message: ...
        const regex = /Severity:\s*(?<severity>error|warning|information)\s*[\r\n]+(?:Location:\s*(?<location>[^\r\n]+)[\r\n]+)?Message:\s*(?<message>[^\r\n]+)/gmi;
        let match;

        while ((match = regex.exec(logOutput)) !== null) {
            const severity = this.toSeverity(match.groups?.severity ?? 'error');
            const message = match.groups?.message?.trim() ?? 'Unknown validation issue';
            const locationPath = match.groups?.location ?? filePath;

            const lineNumber = 0; // Firely gibt oft keine Zeile zurück
            const range = new Range(lineNumber, 0, lineNumber, 100);

            const diagnostic = new Diagnostic(severity, message, filePath, range);
            diagnostics.push(diagnostic);
        }

        if (diagnostics.length === 0) {
            this.debugHandler.log("info", "No issues found by Firely parser.");
        }

        return diagnostics;
    }

    private toSeverity(sev: string): DiagnosticSeverity {
        switch (sev.toLowerCase()) {
            case 'warning': return DiagnosticSeverity.Warning;
            case 'information': return DiagnosticSeverity.Information;
            default: return DiagnosticSeverity.Error;
        }
    }
}