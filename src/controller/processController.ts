import * as vscode from 'vscode';
import { spawn } from 'node:child_process';
import { DebugHandler } from './debugHandler';
export class ProcessController{

    debugHandler : DebugHandler;

    constructor(debugHandler : DebugHandler){
        this.debugHandler = debugHandler;
    }

    public execShellCommandAsync(cmd: string, arg:string[], outputChannel: string) : Promise<string>{
        return new Promise((resolve, reject) => {
            try {
                let logCommand = cmd + ' ' + arg.join(' ');

                let output = this.prepareOutput(outputChannel);
                let stringoutput = "";

                this.debugHandler.log("info", "Executing: '" + logCommand + "'");
                output.appendLine(logCommand);

                const run = spawn(cmd,arg);
                run.stdout.on('data', (data: any) => {
                    output.appendLine(data);
                    this.debugHandler.log("info" , data);
                    stringoutput += data;
                });

                run.stderr.on('data', (data: any) => {
                    output.appendLine(data);
                    this.debugHandler.log("info" , data);
                    stringoutput += data;
                });

                run.on('close', function (code:any) {
                    output.appendLine(`child process exited with code ${code}`);
                    resolve(stringoutput);
                });
            } catch (e : any) {
                reject(e);
                this.debugHandler.log("error" , e);
            }
        });
    }

    private prepareOutput(outputChannel: string) {
        let output = vscode.window.createOutputChannel(outputChannel);
        output.clear();
        output.show();
        return output;
    }

    public execShellCommandOld(cmdOnly: string, arg:string[], outputChannel: string) : Promise<string>{
        const exec = require('child_process').exec;
        const logCommand = cmdOnly + ' ' + arg.join(' ');
        this.debugHandler.log("info", "Executing: '" + logCommand + "'");
        let output = vscode.window.createOutputChannel(outputChannel);
        output.clear();
        output.appendLine(logCommand);
        output.show();
        return new Promise((resolve, reject) => {
            exec(logCommand, (error: any, stdout: string, stderr: string) => {
            if (error) {
                this.debugHandler.log("error", error);
            }
            if (stderr) {
                this.debugHandler.log("error", stderr);
            }
            output.append(stdout);
            resolve(stdout);
            });
        });
    }
}
