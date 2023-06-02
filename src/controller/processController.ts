import * as vscode from 'vscode';
import { spawn } from 'child_process';
import { DebugHandler } from './debugHandler';

export class ProcessController {
    debugHandler: DebugHandler;
    outputChannels: vscode.OutputChannel[];

    constructor(debugHandler: DebugHandler) {
        this.debugHandler = debugHandler;
        this.outputChannels = [];
    }

    public execShellCommandAsync(cmd: string, args: string[], outputChannel: string): Promise<string> {
        return new Promise((resolve, reject) => {
            try {
                const logCommand = `${cmd} ${args.join(' ')}`;
                const channel = this.prepareChannel(outputChannel);
                let stringOutput = "";

                this.debugHandler.log("info", `Executing: '${logCommand}'`);
                channel.appendLine(logCommand);

                const run = spawn(cmd, args);
                run.stdout.on('data', (data: Buffer) => {
                    const output = data.toString();
                    channel.appendLine(output);
                    stringOutput += output;
                });

                run.stderr.on('data', (data: Buffer) => {
                    const error = data.toString();
                    channel.appendLine(error);
                    this.debugHandler.log("info", error, true);
                    stringOutput += error;
                });

                run.on('close', (code: number) => {
                    channel.appendLine(`child process exited with code ${code}`);
                    resolve(stringOutput);
                });
            } catch (error: any) {
                reject(error);
                this.debugHandler.log("error", error);
            }
        });
    }

    private prepareChannel(channelName: string): vscode.OutputChannel {
        let channel = this.outputChannels.find(c => c.name === channelName);
        if (!channel) {
            channel = vscode.window.createOutputChannel(channelName);
            this.outputChannels.push(channel);
        }
        channel.clear();
        channel.show();
        return channel;
    }

    public execShellCommandOld(cmdOnly: string, args: string[], outputChannel: string): Promise<string> {
        const exec = require('child_process').exec;
        const logCommand = cmdOnly + ' ' + args.join(' ');
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
