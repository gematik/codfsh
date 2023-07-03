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
            const sushiConfigPath = await this.getConfigPath("sushi-config.yaml");
            this.debugHandler.log("info", "Found sushiConfigPath: " + sushiConfigPath);
            const resourceFolder = this.getResourceFolder(sushiConfigPath);
            this.debugHandler.log("info", "Found resourceFolder: " + resourceFolder);
            return new PathValues(sushiConfigPath, resourceFolder);
        } catch (error) {
            return Promise.reject(error);
        }
    }

    public async tryGetConfigPath(filename: string): Promise<string> {
        const configFile = await this.locateConfigFile(filename);
        if (configFile) {
            return vscode.Uri.file(configFile).fsPath;
        } else {
            this.debugHandler.log("info", `Unable to find a '${filename}'-file in the current Workspace.`);
            return "";
        }
    }

    private async getConfigPath(filename: string): Promise<string> {
        try {
            const configFile = await this.locateConfigFile(filename);
            if (configFile) {
                return vscode.Uri.file(configFile).fsPath;
            } else {
                throw new Error(`Unable to find a '${filename}'-file in the current Workspace.`);
            }
        } catch (error) {
            throw error;
        }
    }

    private async locateConfigFile(filename: string) {
        const files = await this.getFiles(this.getWorkspaceFolder());
        const configFile = files.find(file => file.endsWith(filename));
        return configFile;
    }

    private getResourceFolder(sushiConfigPath: string): string {
        return sushiConfigPath.replace("sushi-config.yaml", "");
    }

    private async getFiles(dir: string, depth: number = 0): Promise<string[]> {
        if (depth > 2) {
            return [];
        }

        const dirents = await readdir(dir, { withFileTypes: true });
        const files = await Promise.all(dirents.map(async dirent => {
            const res = resolve(dir, dirent.name);
            return dirent.isDirectory() ? this.getFiles(res, depth + 1) : res;
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