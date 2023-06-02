import { Diagnostic } from "../models/diagnostic";

export class DiagnosticManipulator {
    public manipulate(diagnostics: Diagnostic[]): Record<string, Diagnostic[]> {
        const distinctDiagnostics = this.filterDistinctErrorMessages(diagnostics);
        const distinctDiagnosticsPerFile = this.groupByFile(distinctDiagnostics);
        return distinctDiagnosticsPerFile;
    }

    private filterDistinctErrorMessages(diagnostics: Diagnostic[]): Diagnostic[] {
        const isPropertyValuesEqual = (subject: Diagnostic, target: Diagnostic, propNames: (keyof Diagnostic)[]): boolean =>
            propNames.every(propName => propName in subject && propName in target && subject[propName] === target[propName]);

        const getUniqueItemsByProperties = (items: Diagnostic[], propNames: (keyof Diagnostic)[]): Diagnostic[] =>
            items.filter((item, index, array) =>
                index === array.findIndex(foundItem => isPropertyValuesEqual(foundItem, item, propNames))
            );

        return getUniqueItemsByProperties(diagnostics, ['file', 'message', 'severity', 'lineFrom', 'lineTo']);
    }

    private groupByFile(diagnostics: Diagnostic[]): Record<string, Diagnostic[]> {
        return diagnostics.reduce((grouped, diagnostic) => {
            (grouped[diagnostic.file] = grouped[diagnostic.file] || []).push(diagnostic);
            return grouped;
        }, {} as Record<string, Diagnostic[]>);
    }
}
