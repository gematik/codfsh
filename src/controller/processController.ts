import * as vscode from 'vscode';
import { spawn } from 'node:child_process';
import { DebugHandler } from './debugHandler';
export class ProcessController{

    debugHandler : DebugHandler;

    constructor(debugHandler : DebugHandler){
        this.debugHandler = debugHandler;
    }

    public execShellCommandAsync(cmd: string, arg:string[], outputChannel: string) : Promise<string>{
        let output = vscode.window.createOutputChannel(outputChannel);
        output.clear();
        let logCommand = cmd + ' ' + arg.join(' ');

        output.show();
        let stringoutput = "";
        return new Promise((resolve, reject) => {
            console.log(logCommand);
            this.debugHandler.log("info", "Executing: '" + logCommand + "'");
            output.appendLine(logCommand);
            const run = spawn(cmd,arg);

            run.stdout.on('data', (data: any) => {
                output.appendLine(data);
                console.log(data);
                stringoutput += data;
            });

            run.stderr.on('data', (data: any) => {
                output.appendLine(data);
                console.log(data);
                stringoutput += data;
            });

            run.on('close', function (code:any) {
                    output.appendLine(`child process exited with code ${code}`);
                    resolve(stringoutput);
                });
        });
    }

    public execShellCommandSync(cmdOnly: string, arg:string[], outputChannel: string) : Promise<string>{
        const exec = require('child_process').exec;
        const cmd = cmdOnly + ' ' + arg.join(' ');
        console.log(cmd);
        let output = vscode.window.createOutputChannel(outputChannel);
        output.clear();
        output.appendLine(cmd);
        output.show();
        return new Promise((resolve, reject) => {
            exec(cmd, (error: any, stdout: string, stderr: string) => {
            if (error) {
               // console.log(error);
                //reject(new Error(error));
            }
            output.append(stdout);
            resolve(stdout);
            });
        });
    }
}
