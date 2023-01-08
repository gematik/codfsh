import * as vscode from 'vscode';
import { DiagnosticController } from '../diagnosticController';
import { HapiWrapper } from './hapiWrapper';
import { HapiOutputParser } from './hapiOutputParser';


export class HapiController{
    hapiWrapper : HapiWrapper;
    diagnosticController : DiagnosticController;    
    hapiOutputParser : HapiOutputParser;

    constructor(diagnosticCollection: vscode.DiagnosticCollection){
        //TODO check for validator at given destination
        //TODO check for sushiConfig at usual destination
        //TODO check for proxy at usual destination
        this.hapiWrapper = new HapiWrapper("C:/Users/robho/.fhir/validators/validator_cli_v5.6.89.jar",
        "C:/dev/spec-erezept-medicationrequest-communication/Resources/sushi-config.yaml",
        "C:/dev/spec-erezept-medicationrequest-communication/scripts/validation_script-config.yaml");
        this.diagnosticController = new DiagnosticController(diagnosticCollection);
        this.hapiOutputParser = new HapiOutputParser();
    }

    public checkHapiInstallation(){
        throw new Error('Method not implemented.');
    }
    

    public download() {
        throw new Error('Method not implemented.');
        //wget https://github.com/hapifhir/org.hl7.fhir.core/releases/download/5.6.89/validator_cli.jar -O $Userfolder\.fhir\validators\validator_cli_v5.6.89.jar
    }
   
    public execute() {
        var currentFile = vscode.window.activeTextEditor?.document.uri;
        if (currentFile) {
            vscode.window.showInformationMessage('Running Hapi Validator...');
            let filetoValidate = this.getfileToValidate(currentFile.path);
            this.hapiWrapper.getConsoleOutput(filetoValidate)
                .then((consoleOutput : string) => {
                    var diagnostics = this.hapiOutputParser.getDiagnostics(consoleOutput, filetoValidate);
                    this.diagnosticController.addDiagnostics(diagnostics); 
                    vscode.window.showInformationMessage('Hapi Validator completed.');
                }).catch((error) => {
                    console.log(error);
                    vscode.window.showErrorMessage(error);
                });
        }
    }

    private getfileToValidate(fshFilePath: string) : string {
        //TODO: Implement logic to identify generated output file for given fsh file
        return "C:/dev/spec-erezept-medicationrequest-communication/Resources/fsh-generated/resources/Bundle-CancellationBundleFromDispensingOrganisation.json";
    }
}





