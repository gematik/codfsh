import * as vscode from 'vscode';
import { DebugHandler } from './debugHandler';
import { resolve } from 'path';
import { PathValues } from '../models/pathValues';
import { readdir } from 'fs/promises';

export class PathController {
    debugHandler: DebugHandler;

    constructor(debugHandler: DebugHandler) {
        this.debugHandler = debugHandler;
    }

    public async getPathVariables(): Promise<PathValues> {
        try {
            const sushiConfigPath = await this.getSushiConfig();
            this.debugHandler.log("info", "Found sushiConfigPath: " + sushiConfigPath);
            const resourceFolder = this.getResourceFolder(sushiConfigPath);
            this.debugHandler.log("info", "Found resourceFolder: " + resourceFolder);
            return new PathValues(sushiConfigPath, resourceFolder);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private async getSushiConfig(): Promise<string> {
        try {
            const files = await this.getFiles(this.getWorkspaceFolder());
            const sushiConfigFile = files.find(file => file.endsWith("sushi-config.yaml"));
            if (sushiConfigFile) {
                return vscode.Uri.file(sushiConfigFile).fsPath;
            } else {
                throw new Error("Unable to find a sushi-config.yaml in the current Workspace.");
            }
        } catch (error) {
            throw error;
        }
    }

    private getResourceFolder(sushiConfigPath: string): string {
        return sushiConfigPath.replace("sushi-config.yaml", "");
    }

    private async getFiles(dir: string): Promise<string[]> {
        const dirents = await readdir(dir, { withFileTypes: true });
        const files = await Promise.all(dirents.map(async dirent => {
            const res = resolve(dir, dirent.name);
            return dirent.isDirectory() ? this.getFiles(res) : res;
        }));
        return files.flat();
    }

    private getWorkspaceFolder(): string {
        if (vscode.workspace.workspaceFolders !== undefined) {
            const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
            this.debugHandler.log('info', `Found Workspacefolder in '${workspaceFolder}'`);
            return workspaceFolder;
        } else {
            const message = "Working folder not found. Open a folder and try again.";
            this.debugHandler.log('error', message);
            throw new Error(message);
        }
    }
}