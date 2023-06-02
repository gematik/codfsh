import { DebugHandler } from "./debugHandler";
import { join } from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const readdir = promisify(fs.readdir);

export class FileHandler {
    private debugHandler: DebugHandler;

    constructor(debugHandler: DebugHandler) {
        this.debugHandler = debugHandler;
    }

    public async getGeneratedFiles(ressourcesFolder: string): Promise<string[]> {
        try {
            const generatedFolder = join(ressourcesFolder, 'fsh-generated', 'resources');
            const files = await readdir(generatedFolder);
            return files.map((file: string) => {
                const filePath = join(generatedFolder, file);
                this.debugHandler.log("info", `Found generated File ${filePath}`);
                return filePath;
            });
        } catch (error: any) {
            this.debugHandler.log("error", `Failed to read directory ${ressourcesFolder}: ${error.message}`);
            throw error;
        }
    }

    public async getFilesFromDirectoryRecursively(dir: string): Promise<string[]> {
        try {
            const dirents = await fs.promises.readdir(dir, { withFileTypes: true });
            const tasks = dirents.map((dirent: fs.Dirent) => {
                const res = join(dir, dirent.name);
                return dirent.isDirectory() ? this.getFilesFromDirectoryRecursively(res) : Promise.resolve(res);
            });
            return Array.prototype.concat(...await Promise.all(tasks));
        } catch (error: any) {
            this.debugHandler.log("error", `Failed to read directory ${dir}: ${error.message}`);
            throw error;
        }
    }
}