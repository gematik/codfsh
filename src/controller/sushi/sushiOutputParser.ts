import { DiagnosticSeverity, Range } from "vscode";
import { Diagnostic } from "../../models/diagnostic";
import { DebugHandler } from "../debugHandler";

export class SushiOutputParser{

    debugHandler : DebugHandler;

    constructor(debugHandler : DebugHandler){
        this.debugHandler = debugHandler;
    }

    public getDiagnostics(logOutput: string){
        const regex = /(?<severity>\w+)\s(?<message>.*)\n\s+File:\s(?<file>.*)\n\s+Line:\s(?<line_from>\d+)(\s-\s(?<line_to>\d+))?/gm;
        let m;
        let output = [] ;

        while ((m = regex.exec(logOutput)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            var severityType = DiagnosticSeverity.Error;
            if (m.groups?.severity === "warn" ){
                severityType = DiagnosticSeverity.Warning;
            }
            if (m.groups?.message) {
                var lineFrom: number = +(m.groups?.line_from)- 1;
                var lineTo: number = lineFrom;
                if (m.groups?.line_to) {
                    lineTo = +(m.groups?.line_to) -1;
                }
                output.push(new Diagnostic(severityType, m.groups?.message, m.groups?.file, new Range(lineFrom,0,lineTo,200)));
            }
        }
        return output;
    }
}