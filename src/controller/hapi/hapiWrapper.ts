import { ProcessController } from "../processController";
import { ProxySettings } from "../../models/proxySettings";
import { ConfigHandler } from "../configHandler";
import { DependencyController } from "../dependencyController";


export class HapiWrapper{

    processController : ProcessController;
    dependencyController: DependencyController;
    validatorDestination : string;
    proxyConfig: ProxySettings;

    constructor(configHandler: ConfigHandler){
        this.processController = new ProcessController();
        this.dependencyController = new DependencyController(configHandler);
        this.validatorDestination = configHandler.getFilePathFromConfig("HapiValidator.Executable");
        this.proxyConfig =  configHandler.getProxySettings("HapiValidator.Proxy");
    }

    public async getConsoleOutput(fileToValidate: string) : Promise<string>  {
        //TODO: Check validator available, if not ask to download?!
        return new Promise((resolve, reject) => {
            let cmd = `java -jar ${this.validatorDestination} -version 4.0.1 ${this.formatProxySettings()} ${this.formatDependencies()} ${fileToValidate}`;
            console.log(cmd);
            let output = this.processController.execShellCommand(cmd);
            console.log(output);
            resolve(output);
        });
    }

    public download() {
        throw new Error('Method not implemented.');
        //wget https://github.com/hapifhir/org.hl7.fhir.core/releases/download/5.6.89/validator_cli.jar -O ~\.fhir\validators\validator_cli_v5.6.89.jar
    }

    private formatProxySettings() : string {
        if (this.proxyConfig.active) {
            return `-proxy ${this.proxyConfig.address}`;
        }
        return "";
    }

    private formatDependencies() : string {
        return this.dependencyController.getDependenciesAsIgList().join(" ");
    }


}