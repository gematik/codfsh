import { DiagnosticSeverity, Range } from "vscode";
import { Diagnostic } from "../../models/diagnostic";

export class HapiOutputParser{

    public getDiagnostics(logOutput: string, filetoValidate: string){
        const regex = /(?<severity>\w+)\s@\s(?<path>.*)\s(\(line\s(?<line_from>\d+).\scol(?<col_from>\d+)\))?:\s(?<message>.*)/gm;
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
                var colFrom: number = 0;
                if (m.groups?.col_from) {
                    colFrom = +(m.groups?.col_from) -1;
                }
                output.push(new Diagnostic(severityType, m.groups?.path + " | " +  m.groups?.message, filetoValidate, new Range(lineFrom,colFrom,lineFrom,200)));
            }
        }
        return output;
    }
}