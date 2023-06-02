import { Diagnostic } from "./diagnostic";

export class ValidationResult {
    constructor(
        public file: string,
        public summary: string,
        public text: string,
        public diagnostics: Diagnostic[] = []
    ) {}

    public addDiagnostic(diagnostic: Diagnostic) {
        this.diagnostics.push(diagnostic);
    }

    public setDiagnostics(diagnostics: Diagnostic[]) {
        this.diagnostics = diagnostics;
    }
}
