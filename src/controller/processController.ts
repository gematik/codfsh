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

                const run = spawn('sh', ['-c', logCommand]);
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
}
