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

    // Add a new method to extract and return the version number
    public async getValidatorVersion(validatorDestination: string): Promise<string> {
        const args = [validatorDestination, '-version'];
        const versionOutput = await this.processController.execShellCommandAsync('java -jar', args, "codfsh: Hapi");
        const versionLine = versionOutput.split('\n')[0];
        const version = versionLine.split(' ')[4];  // Get the version string, assuming it's always the 5th element.
        return Promise.resolve(version);
    }
}