import { DiagnosticSeverity, Range } from "vscode";
import { SushiOutput } from "../models/sushiOutput";

export class SushiOutputParser{

    public getParsedOutput(logOutput: string){
        //console.log("parsing: " + logOutput);
        return this.getElements(logOutput);
    }

    private getElements(logOutput: string){
        const regex = /(?<severity>\w+)\s(?<message>.*)\n\s+File:\s(?<file>.*)\n\s+Line:\s(?<line_from>\d+)(\s-\s(?<line_to>\d+))?/gm;
        let m;
        let output = [] ;

        while ((m = regex.exec(logOutput)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            var severityType = DiagnosticSeverity.Error;
            if (m.groups?.severity == "warn" ){
                severityType = DiagnosticSeverity.Warning;
            }
            if (m.groups?.message != null) {
                var lineFrom: number = +(m.groups?.line_from)- 1;
                var lineTo: number = lineFrom;
                if (m.groups?.line_to != null) {
                    lineTo = +(m.groups?.line_to) -1;
                }
                output.push(new SushiOutput(severityType, m.groups?.message, m.groups?.file, new Range(lineFrom,0,lineTo,200)));
            }
        }
        return output;
    }
}