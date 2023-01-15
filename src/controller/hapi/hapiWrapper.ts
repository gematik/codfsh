import { ProcessController } from "../processController";
import { ProxySettings } from "../../models/proxySettings";
import { ConfigHandler } from "../configHandler";
import { DependencyController } from "../dependencyController";
import { PathController } from "../pathController";
import { DebugHandler } from "../debugHandler";
import { Dependency } from "../../models/dependency";


export class HapiWrapper{

    debugHandler : DebugHandler;
    processController : ProcessController;

    validatorDestination : string;
    proxyConfig: ProxySettings;

    constructor(debugHandler : DebugHandler, configHandler: ConfigHandler){
        this.debugHandler = debugHandler;
        this.processController = new ProcessController(this.debugHandler);
        this.validatorDestination = configHandler.getFilePathFromConfig("HapiValidator.Executable");
        this.proxyConfig =  configHandler.getProxySettings("HapiValidator.Proxy");
    }

    public async getConsoleOutput(filesToValidate: string[], dependencies: string[])  : Promise<string>  {
        //TODO: Check validator available, if not ask to download?!
        return new Promise(async (resolve, reject) => {
            let args = [];
            args.push(this.validatorDestination);
            args.push(`-version 4.0.1`);
            args.push(this.formatProxySettings());
            dependencies.forEach(dep => {
                args.push(dep);
            });
            filesToValidate.forEach((file) => {
                 args.push(file);
            });


            let output = this.processController.execShellCommandSync('java -jar',args, "Hapi");
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


}