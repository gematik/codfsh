import { DiagnosticSeverity, Range } from "vscode";
import { Diagnostic } from "../../models/diagnostic";
import { DebugHandler } from "../debugHandler";

export class SushiOutputParser{

    debugHandler : DebugHandler;

    constructor(debugHandler : DebugHandler){
        this.debugHandler = debugHandler;
    }

    public getDiagnostics(logOutput: string){
        const regex = /(?<severity>(warn|error))\s+(?<message>.*)\n?(\s+File:\s(?<file>.*))?\s+(Line:\s(?<line_from>\d+)(\s-\s(?<line_to>\d+))?)?/gm;
        let m;
        let output = [] ;

        while ((m = regex.exec(logOutput)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            if (m.groups?.message) {
                let severity = this.setSeverity(m);
                let range = this.setRange(m);
                const dia = new Diagnostic(severity, m.groups?.message, m.groups?.file, range);
                console.log(dia);
                output.push(dia);
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
        }
        return severityType;
    }
}