import { DebugHandler } from "../debugHandler";
import { PathController } from "../pathController";
import { ProcessController } from "../processController";
import { ConfigHandler } from "../configHandler";
import { SushiSettings } from "../../models/sushiSettings";
const path = require("path");

export class SushiWrapper {

    processController : ProcessController;
    debugHandler : DebugHandler;
    pathController : PathController;
    configHandler: ConfigHandler;

    constructor(debugHandler : DebugHandler, pathController : PathController, configHandler: ConfigHandler, processController : ProcessController ){
        this.debugHandler = debugHandler;
        this.pathController = pathController;
        this.processController = processController;
        this.configHandler = configHandler;
    }

    public async getConsoleOutput(ressourceFolderPath : string) : Promise<string>  {
        return new Promise(async (resolve, reject) => {
            let sushiSettings = this.configHandler.getSushiSettings("Sushi.Settings");
            try{
                let output = await this.runSushi(ressourceFolderPath, sushiSettings);
                resolve(output);
            }
            catch(e){
                reject(e);
            }
        });
    }

    private async runSushi(ressourceFolderPath: string, sushiSettings: SushiSettings) {
        let args: string[] = [];
        const ressourceFolderPathPosix = `"${ressourceFolderPath.split(path.sep).join(path.posix.sep)}"`;
        args.push(ressourceFolderPathPosix);
        this.handleSushieSettings(sushiSettings, args);
        let output = await this.processController.execShellCommandAsync("sushi", args, "codfsh: Sushi");
        return output;
    }

    private handleSushieSettings(sushiSettings: SushiSettings, args: string[]) {
        if (sushiSettings.generateSnapshots) {
            this.debugHandler.log("info","Snapshot generation is active!");
            args.push('-s');
        }
    }
}
