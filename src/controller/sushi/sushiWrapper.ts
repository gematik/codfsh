import { PathValues } from "../../models/pathValues";
import { DebugHandler } from "../debugHandler";
import { PathController } from "../pathController";
import { ProcessController } from "../processController";
import { join } from 'path';
export class SushiWrapper {

    processController : ProcessController;
    debugHandler : DebugHandler;
    pathController : PathController;

    constructor(debugHandler : DebugHandler, pathController : PathController){
        this.debugHandler = debugHandler;
        this.pathController = pathController;
        this.processController = new ProcessController(this.debugHandler);
    }

    public async getConsoleOutput(ressourceFolderPath : string) : Promise<string>  {
        return new Promise(async (resolve, reject) => {
            try{
                    let args : string[] = [];
                    args.push(ressourceFolderPath);
                    args.push('-s');
                    let output = await this.processController.execShellCommandAsync("sushi", args, "Sushi");
                    resolve(output);
                }
                catch(e){
                    reject(e);
                }
        });
    }
}
