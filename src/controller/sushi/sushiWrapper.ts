import { ProcessController } from "../processController";
import { join } from 'path';
export class SushiWrapper {

    processController : ProcessController;

    constructor(){
        this.processController = new ProcessController();
    }

    public async getConsoleOutput(fshFilePath: string) : Promise<string>  {
        return new Promise((resolve, reject) => {
            this.getRessourcePath(fshFilePath).then((ressourcesFolderPath) => {
                let args = [];
                args.push(ressourcesFolderPath);
                args.push('-s');
                resolve(this.processController.execShellCommand("sushi", args, "Sushi"));
            }).catch((error) => {
                reject(error);
            });
        });
    }

     private getRessourcePath(fshFilePath:string): Promise<string> {
        return new Promise((resolve, reject) => {
            var resPath = this.searchRessourcePath(fshFilePath, '/input/fsh');
            if(this.isValidPath(resPath)){
                resolve(resPath);
            }
            resPath = this.searchRessourcePath(fshFilePath, '/_preprocessed');
            if(this.isValidPath(resPath)){
                resolve(resPath);
            }
            reject(new Error("Unable to find folder structure expected by SUSHI for a FSH project"));
        });
    }

    private searchRessourcePath(fshFilePath: string, input: string) {
        var resPath = fshFilePath.split(input)[0];
        resPath = join(resPath);
        return resPath;
    }

    private isValidPath(resPath: string): boolean {
        if(resPath.split('/').pop() === "Resources"){
            return true;
        }
        return false;
    }


}
