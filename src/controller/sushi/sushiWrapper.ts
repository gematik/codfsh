import { DebugHandler } from "../debugHandler";
import { PathController } from "../pathController";
import { ProcessController } from "../processController";
import { ConfigHandler } from "../configHandler";
import { SushiSettings } from "../../models/sushiSettings";

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
                    let args : string[] = [];
                    args.push(ressourceFolderPath);
                    this.handleSushieSettings(sushiSettings, args);
                    let output = await this.processController.execShellCommandAsync("sushi", args, "Sushi");
                    resolve(output);
                }
                catch(e){
                    reject(e);
                }
        });
    }

    private handleSushieSettings(sushiSettings: SushiSettings, args: string[]) {
        if (sushiSettings.generateSnapshots) {
            this.debugHandler.log("info","Snapshot generation is active!");
            args.push('-s');
        }
    }
}
