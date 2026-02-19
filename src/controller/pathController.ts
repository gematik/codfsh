import * as vscode from 'vscode';
import { DebugHandler } from './debugHandler';
import { basename, dirname, resolve } from 'path';
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
            const sushiConfigFiles = files.filter(file => this.isSushiConfig(file));
            if (sushiConfigFiles.length === 1) {
                return vscode.Uri.file(sushiConfigFiles[0]).fsPath;
            }
            if (sushiConfigFiles.length > 1) {
                return await this.pickSushiConfig(sushiConfigFiles);
            }
            throw new Error("Unable to find a sushi-config.yaml or sushi-config.yml in the current Workspace.");
        } catch (error) {
            throw error;
        }
    }

    private async pickSushiConfig(sushiConfigFiles: string[]): Promise<string> {
        const items = sushiConfigFiles.map(file => {
            const label = basename(dirname(file)) || file;
            const description = vscode.workspace.asRelativePath(file, false);
            return { label, description, file };
        });

        const selection = await vscode.window.showQuickPick(items, {
            title: 'Select Sushi config to use',
            placeHolder: 'Choose an implementation guide folder',
            ignoreFocusOut: true
        });

        if (!selection) {
            throw new Error('Sushi config selection cancelled.');
        }

        const selectedPath = selection.file;
        this.debugHandler.log('info', `Selected sushi-config: ${selectedPath}`);
        return vscode.Uri.file(selectedPath).fsPath;
    }

    private isSushiConfig(file: string): boolean {
        return file.endsWith('sushi-config.yaml') || file.endsWith('sushi-config.yml');
    }

    private getResourceFolder(sushiConfigPath: string): string {
        if (sushiConfigPath.endsWith('sushi-config.yml')) {
            return sushiConfigPath.replace('sushi-config.yml', '');
        }
        return sushiConfigPath.replace('sushi-config.yaml', '');
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