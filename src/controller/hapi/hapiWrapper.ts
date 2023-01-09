import { Dependency } from "../../models/dependency";
import { ProcessController } from "../processController";
import { ProxySettings } from "../../models/proxySettings";


export class HapiWrapper{

    processController : ProcessController;
    validatorDestination : string;
    dependencies: Dependency[];
    proxyConfig: ProxySettings;

    constructor(validatorDestination: string, dependencies: Dependency[], proxySettings: ProxySettings){
        this.validatorDestination = validatorDestination;
        this.dependencies = dependencies;
        this.proxyConfig = proxySettings;
        this.processController = new ProcessController();
    }

    public async getConsoleOutput(fileToValidate: string) : Promise<string>  {
        return new Promise((resolve, reject) => {
            let cmd = `java -jar ${this.validatorDestination} -version 4.0.1 ${this.formatProxySettings()} ${this.formatDepencencies()} ${fileToValidate}`;
            console.log(cmd);
            let output = this.processController.execShellCommand(cmd);
            console.log(output);
            resolve(output);
        });
    }

    private formatProxySettings() : string {
        if (this.proxyConfig.active) {
            return `-proxy ${this.proxyConfig.address}`;
        }
        return "";
    }

    private formatDepencencies() : string {
        let result : string[] = []; 
        this.dependencies.forEach((dependency) => {
            result.push(`-ig ${dependency.name}#${dependency.version}`);
        });
        return result.join(" ");
    }
}