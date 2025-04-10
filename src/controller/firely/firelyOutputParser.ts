import { DiagnosticSeverity, Range } from 'vscode';
import { Diagnostic } from '../../models/diagnostic';
import { DebugHandler } from '../debugHandler';
import * as path from 'path';

export class FirelyOutputParser {
    debugHandler: DebugHandler;

    constructor(debugHandler: DebugHandler) {
        this.debugHandler = debugHandler;
    }

    public getDiagnostics(logOutput: string, fallbackFilePath: string): Diagnostic[] {
        const diagnostics: Diagnostic[] = [];

        const lines = logOutput.split(/\r?\n/);
        let currentFile = fallbackFilePath;
        let pending: Partial<Diagnostic> = {};

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // 1. Datei-Zuweisung
            const fileMatch = line.match(/^(.+\.json|\.xml)$/);
            if (fileMatch) {
                currentFile = fileMatch[1].trim();
                continue;
            }

            // 2. Error oder Warning
            const issueMatch = line.match(/^(Error|Warning):\s+(.*)$/i);
            if (issueMatch) {
                pending = {
                    severity: this.toSeverity(issueMatch[1]),
                    message: issueMatch[2].trim(),
                    file: currentFile,
                    range: new Range(0, 0, 0, 100), // kein Line-Mapping möglich
                };
                continue;
            }

            // 3. Kontext "At:" oder Constraint-ID
            if (pending && pending.message) {
                if (line.startsWith("At: ")) {
                    pending.message += `\nAt: ${line.replace("At: ", "").trim()}`;
                } else if (line.match(/^http(s)?:\/\/.*?\|(.+)$/)) {
                    const constraint = line.trim();
                    pending.message += `\nConstraint: ${constraint}`;
                    diagnostics.push(new Diagnostic(
                        pending.severity!,
                        pending.message!,
                        pending.file!,
                        pending.range!
                    ));
                    pending = {};
                }
            }
        }

        // Sonderfall: keine Fehler gefunden
        if (/No issues found/i.test(logOutput)) {
            this.debugHandler.log("info", "Firely found no issues.");
        }

        return diagnostics;
    }

    private toSeverity(raw: string): DiagnosticSeverity {
        switch (raw.toLowerCase()) {
            case 'warning': return DiagnosticSeverity.Warning;
            default: return DiagnosticSeverity.Error;
        }
    }
}