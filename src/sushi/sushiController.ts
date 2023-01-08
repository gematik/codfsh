import * as vscode from 'vscode';
import { Diagnostic } from 'vscode';
import { SushiWrapper } from './sushiWrapper';
import { SushiOutput } from '../models/sushiOutput';

export class SushiController{
   
    public execute() {
        var currentFile = vscode.window.activeTextEditor?.document.uri;
        let diagnosticCollection: vscode.DiagnosticCollection;
        diagnosticCollection = vscode.languages.createDiagnosticCollection('fsh');
        
        if (currentFile) {
            vscode.window.showInformationMessage('Running Sushi...');

            let sushiWrapper = new SushiWrapper(currentFile.path);
            sushiWrapper.getSushiOutput().then((output) => {
                vscode.window.showInformationMessage('Sushi Done.');
                this.addDiagnostics(output, diagnosticCollection); 
            });
        }
    }

    private addDiagnostics(unfilteredOutput: SushiOutput[], diagnosticCollection: vscode.DiagnosticCollection) {
        let distinctOutput = this.filterToDistinctErrorMessages(unfilteredOutput);
        console.log(distinctOutput);
        let distinctOutputPerFile = this.groupOutputByFile(distinctOutput);
        for (const file in distinctOutputPerFile) {
            if (distinctOutputPerFile.hasOwnProperty(file)) {
                this.addDiagnosticsPerFile(distinctOutputPerFile, file, diagnosticCollection);
            }
            else
                {console.log("ERROR: distinctOutputPerFile hat die property file nicht!")}
        }
    }

    private addDiagnosticsPerFile(distinctOutputPerFile: { [key: string]: SushiOutput[]; }, file: string, diagnosticCollection: vscode.DiagnosticCollection) {
        let findings = distinctOutputPerFile[file];
        let diagnostics: Array<vscode.Diagnostic> = Array();
        findings.forEach(output => {
            diagnostics.push(new Diagnostic(output.range, output.message, output.severity));
        });
        diagnosticCollection.set(vscode.Uri.file(file), diagnostics);
    }

    private filterToDistinctErrorMessages(output: SushiOutput[]) : SushiOutput[] {
        const isPropValuesEqual = (subject: { [x: string]: any; }, target: { [x: string]: any; }, propNames: any[]) =>
        propNames.every(propName => subject[propName] === target[propName]);
      
        const getUniqueItemsByProperties = (items: any[], propNames: any[]) => 
        items.filter((item, index, array) =>
          index === array.findIndex(foundItem => isPropValuesEqual(foundItem, item, propNames))
        );

        return getUniqueItemsByProperties(output,['file', 'message', 'severity', 'lineFrom', 'lineTo']);
    }

    private groupOutputByFile(output : SushiOutput[]) : {[key: string]: SushiOutput[]} {
        var groupBy = function(xs: any[], key: string | number) : {[key: string]: SushiOutput[]} {
            return xs.reduce(function(rv, x) {
              (rv[x[key]] = rv[x[key]] || []).push(x);
              return rv;
            }, {});
          };
          let groupedResult =  groupBy(output, 'file');
          console.log(groupedResult);
          return groupedResult;
    }
}





