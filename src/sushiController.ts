import * as vscode from 'vscode';
import { WorkspaceFolder, DebugConfiguration, ProviderResult, CancellationToken, Diagnostic } from 'vscode';
import { SushiWrapper } from './sushiWrapper';

export function execute(context: vscode.ExtensionContext, factory?: vscode.DebugAdapterDescriptorFactory) {
    
    var currentFile = vscode.window.activeTextEditor?.document.uri;
    let diagnosticCollection: vscode.DiagnosticCollection;
    diagnosticCollection = vscode.languages.createDiagnosticCollection('fsh');
    let diagnostics: Array<vscode.Diagnostic> = Array();
   


    if (currentFile) {
        var path = currentFile.path;
        console.log(path.toString());
        let sushiWrapper = new SushiWrapper(path);
        sushiWrapper.getSushiOutput();
        let range = new vscode.Range(4, 0, 4, 100);
        let d = new Diagnostic(range, "Testnachricht" , vscode.DiagnosticSeverity.Error);

        diagnostics.push(d);
        diagnosticCollection.set(currentFile, diagnostics);
    }


    vscode.window.showInformationMessage('Running Sushi...');
}


