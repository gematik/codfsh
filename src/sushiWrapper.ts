import { execSync } from 'node:child_process';

export class SushiWrapper {
    ressourcesFolderPath: string;

    constructor(fshFilePath: string) {
        this.ressourcesFolderPath = this.getRessourcePath(fshFilePath);
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

    public getSushiOutput() {
        console.log("running: sushi " + this.ressourcesFolderPath);
        let buf = execSync("sushi " + this.ressourcesFolderPath);
        var sushiOutput = buf.toString();
        console.log(sushiOutput);

    }

}
