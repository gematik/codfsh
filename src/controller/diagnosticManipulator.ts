import { Diagnostic } from "../models/diagnostic";

export class DiagnosticManipulator{

    public manipulate(diagnostics: Diagnostic[]) : {[key: string]: Diagnostic[]} {
        let distinctDiagnostics = this.filterToDistinctErrorMessages(diagnostics);
        let distinctDiagnosticsPerFile = this.groupOutputByFile(distinctDiagnostics);
        return distinctDiagnosticsPerFile;
    }

    private filterToDistinctErrorMessages(diagnistics: Diagnostic[]) : Diagnostic[] {
        const isPropValuesEqual = (subject: { [x: string]: any; }, target: { [x: string]: any; }, propNames: any[]) =>
        propNames.every(propName => subject[propName] === target[propName]);
      
        const getUniqueItemsByProperties = (items: any[], propNames: any[]) => 
        items.filter((item, index, array) =>
          index === array.findIndex(foundItem => isPropValuesEqual(foundItem, item, propNames))
        );

        return getUniqueItemsByProperties(diagnistics,['file', 'message', 'severity', 'lineFrom', 'lineTo']);
    }

    private groupOutputByFile(diagnostics : Diagnostic[]) : {[key: string]: Diagnostic[]} {
        var groupBy = function(xs: any[], key: string | number) : {[key: string]: Diagnostic[]} {
            return xs.reduce(function(rv, x) {
              (rv[x[key]] = rv[x[key]] || []).push(x);
              return rv;
            }, {});
          };
          let groupedResult =  groupBy(diagnostics, 'file');
          console.log(groupedResult);
          return groupedResult;
    }
}