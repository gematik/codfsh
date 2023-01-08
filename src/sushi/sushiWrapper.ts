import { SushiOutput } from '../models/sushiOutput';
import { SushiOutputParser } from './sushiOutputParser';


export class SushiWrapper {
    ressourcesFolderPath: string;
    sushiOutputParser : SushiOutputParser;

    constructor(fshFilePath: string) {
        this.ressourcesFolderPath = this.getRessourcePath(fshFilePath);
        this.sushiOutputParser = new SushiOutputParser();
    }

    private getRessourcePath(fshFilePath:string){
        var resPath =  fshFilePath.split('/input/fsh')[0];
        if (resPath[0] === "/")
            {
                resPath = resPath.substring(1);
            }
        console.log(resPath);
        return resPath;
    }

    private execShellCommand(cmd: string) : Promise<string>{
        const exec = require('child_process').exec;
        return new Promise((resolve, reject) => {
            exec(cmd, (error: any, stdout: string, stderr: string) => {
            if (error) {
                console.warn(error);
            }
            resolve(stdout? stdout : stderr);
            });
        });
    }
   
    public async getSushiOutput() : Promise<SushiOutput[]>  {
        const sushiOutput =  await this.execShellCommand("sushi " + this.ressourcesFolderPath);
        var output = this.sushiOutputParser.getParsedOutput(sushiOutput);
        return output;
    }

   

}
