import * as vscode from 'vscode';
import { spawn } from 'node:child_process';
import { DebugHandler } from './debugHandler';
export class ProcessController{

    debugHandler : DebugHandler;
    outputChannels : vscode.OutputChannel[];

    constructor(debugHandler : DebugHandler){
        this.debugHandler = debugHandler;
        this.outputChannels = [];
    }

    public execShellCommandAsync(cmd: string, arg:string[], outputChannel: string) : Promise<string>{
        return new Promise((resolve, reject) => {
            try {
                let logCommand = cmd + ' ' + arg.join(' ');

                let channel = this.prepareChannel(outputChannel);
                let stringoutput = "";

                this.debugHandler.log("info", "Executing: '" + logCommand + "'");
                channel.appendLine(logCommand);

                const run = spawn(cmd,arg);
                run.stdout.on('data', (data: any) => {
                    channel.appendLine(data);
                    stringoutput += data;
                });

                run.stderr.on('data', (data: any) => {
                    channel.appendLine(data);
                    this.debugHandler.log("info" , data, true);
                    stringoutput += data;
                });

                run.on('close', function (code:any) {
                    channel.appendLine(`child process exited with code ${code}`);
                    resolve(stringoutput);
                });
            } catch (e : any) {
                reject(e);
                this.debugHandler.log("error" , e);
            }
        });
    }

    private prepareChannel(channelName: string) {
        let channel = this.outputChannels.filter(c => c.name === channelName)[0];
        if (!channel) {
            channel = vscode.window.createOutputChannel(channelName);
            this.outputChannels.push(channel);
        }
        channel.clear();
        channel.show();
        return channel;
    }

    public execShellCommandOld(cmdOnly: string, arg:string[], outputChannel: string) : Promise<string>{
        const exec = require('child_process').exec;
        const logCommand = cmdOnly + ' ' + arg.join(' ');
        this.debugHandler.log("info", "Executing: '" + logCommand + "'");
        let channel = this.prepareChannel(outputChannel);
        channel.clear();
        channel.appendLine(logCommand);
        channel.show();
        return new Promise((resolve, reject) => {
            exec(logCommand, (error: any, stdout: string, stderr: string) => {
            if (error) {
                this.debugHandler.log("error", error, true);
            }
            if (stderr) {
                this.debugHandler.log("error", stderr, true);
            }
            channel.append(stdout);
            resolve(stdout);
            });
        });
    }
}
