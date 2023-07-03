import { ProcessController } from "../processController";
import { ConfigHandler } from "../configHandler";
import { DebugHandler } from "../debugHandler";
import { PathController } from "../pathController";


export class HapiWrapper{

    debugHandler : DebugHandler;
    processController : ProcessController;
    configHandler: ConfigHandler;

    constructor(debugHandler : DebugHandler,  configHandler: ConfigHandler){
        this.debugHandler = debugHandler;
        this.processController = new ProcessController(this.debugHandler);
        this.configHandler = configHandler;
    }

    public async getConsoleOutput(validatorDestination: string, filesToValidate: string[], dependencies: string[], validatorParameters: any): Promise<string> {
        const args = [validatorDestination, ...this.buildArgs(validatorParameters), ...dependencies, ...filesToValidate];
        const output = await this.processController.execShellCommandAsync('java -jar', args, "codfsh: Hapi");
        this.debugHandler.log("info", "received output");
        return Promise.resolve(output);
    }

    private buildArgs(validatorParameters: any) {
        return Object.entries(validatorParameters).flatMap(([key, value]) => (value === true) ? [`-${key}`] : [`-${key}`, `${value}`]);
    }
}