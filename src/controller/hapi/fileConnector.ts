import * as vscode from 'vscode';
import * as fs from 'fs';
import { join, basename } from 'path';
import { FshParser } from './fshParser';
import { DebugHandler } from '../debugHandler';

export class FileConnector {
    private fshParser: FshParser;
    private debugHandler: DebugHandler;

    constructor(debugHandler: DebugHandler) {
        this.debugHandler = debugHandler;
        this.fshParser = new FshParser();
    }

    public identifyGeneratedResources(currentFile: vscode.Uri, resourcesFolder: string): string[] {
        const resultFiles: string[] = [];
        if (this.isGeneratedFile(currentFile)) {
            this.debugHandler.log("info", `Added current file for Hapi validation: '${currentFile.fsPath}'`);
            resultFiles.push(join(currentFile.fsPath));
            return resultFiles;
        }

        const foundIds = this.searchForIdsInFile(currentFile.fsPath);
        const files = this.searchGeneratedFileWithId(foundIds, resourcesFolder);

        if (resultFiles.length === 0) {
            files.push(currentFile.fsPath);
            this.debugHandler.log("info", `Added current file for Hapi validation: '${currentFile.fsPath}'`);
        }

        return files;
    }

    private searchGeneratedFileWithId(ids: string[], resourcesFolder: string): string[] {
        const resultFiles: string[] = [];
        const generatedFolder = join(resourcesFolder, 'fsh-generated', 'resources');
        const files = fs.readdirSync(generatedFolder);
        ids.forEach(id => {
            files.forEach(file => {
                if (basename(file).includes(id.replace('"', ""))) {
                    const filePath = join(generatedFolder, file);
                    this.debugHandler.log("info", `Found file which was generated from this file for Hapi Validation: '${filePath}'`);
                    resultFiles.push(filePath);
                }
            });
        });
        return resultFiles;
    }

    private isGeneratedFile(currentFile: vscode.Uri): boolean {
        return currentFile.path.includes("fsh-generated");
    }

    private searchForIdsInFile(currentFile: string): string[] {
        const fshContent = fs.readFileSync(join(currentFile), 'utf8');
        return this.fshParser.getIdsFromFshFile(fshContent);
    }
}
