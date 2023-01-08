import { Diagniostic } from "../models/diagnostic";

export class DiagnosticManipulator{

    public manipulate(diagnostics: Diagniostic[]) : {[key: string]: Diagniostic[]} {
        let distinctDiagnostics = this.filterToDistinctErrorMessages(diagnostics);
        let distinctDiagnosticsPerFile = this.groupOutputByFile(distinctDiagnostics);
        return distinctDiagnosticsPerFile;
    }

    private filterToDistinctErrorMessages(diagnistics: Diagniostic[]) : Diagniostic[] {
        const isPropValuesEqual = (subject: { [x: string]: any; }, target: { [x: string]: any; }, propNames: any[]) =>
        propNames.every(propName => subject[propName] === target[propName]);
      
        const getUniqueItemsByProperties = (items: any[], propNames: any[]) => 
        items.filter((item, index, array) =>
          index === array.findIndex(foundItem => isPropValuesEqual(foundItem, item, propNames))
        );

        return getUniqueItemsByProperties(diagnistics,['file', 'message', 'severity', 'lineFrom', 'lineTo']);
    }

    private groupOutputByFile(diagnostics : Diagniostic[]) : {[key: string]: Diagniostic[]} {
        var groupBy = function(xs: any[], key: string | number) : {[key: string]: Diagniostic[]} {
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