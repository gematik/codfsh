import { DebugHandler } from "./debugHandler";
import { join } from 'path';
const { readdir } = require('fs').promises;
import { resolve } from 'path';
import fs = require('fs');

export class FileHander {
    debugHandler: DebugHandler;

    constructor(debugHandler: DebugHandler){
        this.debugHandler = debugHandler;
    }

    public getGeneratedFiles(ressourcesFolder : string) : Promise<string[]> {
        return new Promise(async (resolve, reject) => {
            let generatedFiles : string[] = [];
            try{
                let generatedFolder = join(ressourcesFolder,'fsh-generated','resources');
                let files = fs.readdirSync(generatedFolder);
                files.forEach(file => {
                    generatedFiles.push(join(generatedFolder, file));
                    this.debugHandler.log("info","Found generated File " + join(generatedFolder, file));
                });
                resolve(generatedFiles);
            } catch (e) {
                reject(e);
            }
        });        
    }

    public async getFilesFromDirectoryRecursivly(dir: string)  : Promise<string[]> {
        async function getFiles(dir: string) {
            const dirents = await readdir(dir, { withFileTypes: true }).filter();
            const files = await Promise.all(dirents.map((dirent: { name: string; isDirectory: () => any; }) => {
              const res = resolve(dir, dirent.name);
              return dirent.isDirectory() ? getFiles(res) : res;
            }));
            return files.flat();
          }

          return new Promise(async (resolve, reject) => {
            try{
                let files = await getFiles(dir);
                resolve(files);
            } catch (e) {
                reject(e);
            }
        });
    }
        
    
}