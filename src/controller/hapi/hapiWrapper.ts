import { ProcessController } from "../processController";
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
        return new Promise(async (resolve, reject) => {
            const validatorDestination = this.configHandler.getFilePathFromConfig("HapiValidator.Executable");
            let validatorParameters = this.configHandler.getHapiParameters("HapiValidator.Settings");

            let args = [];
            args.push(validatorDestination);
            for (const key in validatorParameters) {
                if (validatorParameters[key] === true) {
                    args.push(`-${key}`);
                } else {
                    args.push(`-${key} ${validatorParameters[key]}`);
                }
            }
            
            dependencies.forEach(dep => {
                args.push(dep);
            });
            filesToValidate.forEach((file) => {
                 args.push(file);
            });

            let output = await this.processController.execShellCommandAsync('java -jar',args, "codfsh: Hapi");
            this.debugHandler.log("info","received output");
            resolve(output);
        });
    }
}