import { DiagnosticSeverity, Range } from "vscode";
import { SushiOutput } from "../models/sushiOutput";

export class SushiOutputParser{

    public getParsedOutput(logOutput: string){
        //console.log("parsing: " + logOutput);
        return this.getElements(logOutput);
    }

    private getElements(logOutput: string){
        const regex = /(?<severity>\w+)\s(?<message>.*)\n\s+File:\s(?<file>.*)\n\s+Line:\s(?<line>\d+)/gm;
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
                var lineInt: number = +(m.groups?.line);
                output.push(new SushiOutput(severityType, m.groups?.message, m.groups?.file, new Range(lineInt,0,lineInt,10)));
            }
        }
        return output;
    }
}