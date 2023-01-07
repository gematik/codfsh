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
        vscode.window.showInformationMessage('Running Sushi...');
        let output = sushiWrapper.getSushiOutput();
        vscode.window.showInformationMessage('Sushi Done.');
        output.forEach(output => {
            console.log(output.message);
            let d = new Diagnostic(output.range, output.message , output.severity);
            diagnostics.push(d);
        });
       

        
        diagnosticCollection.set(currentFile, diagnostics);
    }


    
}


