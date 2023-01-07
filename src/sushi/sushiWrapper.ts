import { SushiOutput } from '../models/sushiOutput';
import { Range } from 'vscode';
import { SushiOutputParser } from './sushiOutputParser';
var childProcess = require('child_process');


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

    private runScript(command: any, args: any, callback: (arg0: string, arg1: any) => void) {
        console.log("Starting Process." + command);
        var child = childProcess.spawn(command, args);
    
        var scriptOutput = "";
    
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', function(data: string) {
            console.log('stdout: ' + data);
    
            data=data.toString();
            scriptOutput+=data;
        });
    
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', function(data: string) {
            console.log('stderr: ' + data);
    
            data=data.toString();
            scriptOutput+=data;
        });
    
        child.on('close', function(code: any) {
            callback(scriptOutput,code);
        });
    }

    private startSushi(){
        console.log("running: sushi " + this.ressourcesFolderPath);
        this.runScript("sushi" , [this.ressourcesFolderPath], function(output, exitCode: any) {
       // this.runScript("ls" , ["-l"], function(output, exitCode: any) {
            console.log("Process Finished.");
            console.log('closing code: ' + exitCode);
            console.log('Full output of script: ',output);
        });


    }
    private startSushi2()  : SushiOutput[] {
        const cp = require('child_process') ;
        var sushiOutputParser = new SushiOutputParser();
        cp.exec("sushi " + this.ressourcesFolderPath, (err: string, stdout: string, stderr: string) => {
            let output = sushiOutputParser.getParsedOutput(stdout);
            console.log(output[0].message);
            return output;
        });
        return [];
    }


    public getSushiOutput() : SushiOutput[]  {
        return this.startSushi2();   
        //return new SushiOutput(new Range(2,5,2,2),"Testmessage", SeverityType.error);

    }

}
