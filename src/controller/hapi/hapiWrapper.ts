import { ProcessController } from "../processController";
import { ProxySettings } from "../../models/proxySettings";
import { ConfigHandler } from "../configHandler";
import { DebugHandler } from "../debugHandler";


export class HapiWrapper{

    debugHandler : DebugHandler;
    processController : ProcessController;
    configHandler: ConfigHandler;

    constructor(debugHandler : DebugHandler, configHandler: ConfigHandler){
        this.debugHandler = debugHandler;
        this.processController = new ProcessController(this.debugHandler);
        this.configHandler = configHandler;
  }

    public async getConsoleOutput(filesToValidate: string[], dependencies: string[])  : Promise<string>  {
        //TODO: Check validator available, if not ask to download?!
        return new Promise(async (resolve, reject) => {
            const validatorDestination = this.configHandler.getFilePathFromConfig("HapiValidator.Executable");

            let args = [];
            args.push(validatorDestination);
            args.push(`-version 4.0.1`);
            args.push(`-jurisdiction DE`);
            args.push(`-locale de-DE`);
            args.push(`-tx n/a`);
            args.push(`-debug`);
            args.push(this.formatProxySettings());
            dependencies.forEach(dep => {
                args.push(dep);
            });
            filesToValidate.forEach((file) => {
                 args.push(file);
            });

            let output = await this.processController.execShellCommandOld('java -jar',args, "Hapi");
            this.debugHandler.log("info","received output");
            resolve(output);
        });
    }

    public download() {
        throw new Error('Method not implemented.');
        //wget https://github.com/hapifhir/org.hl7.fhir.core/releases/download/5.6.89/validator_cli.jar -O ~\.fhir\validators\validator_cli_v5.6.89.jar
    }

    private formatProxySettings() : string {
        const proxyConfig =  this.configHandler.getProxySettings("HapiValidator.Proxy");
        if (proxyConfig.active) {
            return `-proxy ${proxyConfig.address}`;
        }
        return "";
    }


}