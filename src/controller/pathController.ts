import * as vscode from 'vscode';
import { DebugHandler } from './debugHandler';
import { resolve } from 'path';
import { PathValues } from '../models/pathValues';
const { readdir } = require('fs').promises;
var path = require("path");

export class PathController{

    debugHandler : DebugHandler;

    constructor(debugHandler : DebugHandler){
        this.debugHandler = debugHandler;
    }

    public async getPathVariables() : Promise<PathValues> {
        return new Promise(async (resolve, reject) => {
            try {
                const sushiConfigPath = await this.getSushiConfig();
                this.debugHandler.log("info", "Found sushiConfigPath: " + sushiConfigPath);
                let ressourceFolder = this.getResouceFolder(sushiConfigPath);
                this.debugHandler.log("info", "Found ressourceFolder: " + ressourceFolder);
                resolve(new PathValues(sushiConfigPath,ressourceFolder));
            } catch (e) {
                reject(e);
            }
        });
    }

    private getSushiConfig() : Promise<string> {
        async function getFiles(dir: string) {
            const dirents = await readdir(dir, { withFileTypes: true });
            const files = await Promise.all(dirents.map((dirent: { name: string; isDirectory: () => any; }) => {
              const res = resolve(dir, dirent.name);
              return dirent.isDirectory() ? getFiles(res) : res;
            }));
            return files.flat();
          }

          return new Promise(async (resolve, reject) => {
            let find = undefined;
            let files = await getFiles(this.getWorkspaceFolder());
            files.forEach((file: string) => {
                if (path.basename(file) === "sushi-config.yaml"){
                    find = file;
                    resolve(file);
                    return;
                }
            }); 

            if(find !== undefined){
                return find;
            }else{
                reject("Unable to find a sushi-config.yaml in current Workpace."); 
            }
        });
    }

    private getResouceFolder(sushiConfigPath: string) : string{
        return sushiConfigPath.replace("sushi-config.yaml","");
    }

    private getWorkspaceFolder(){
        if(vscode.workspace.workspaceFolders !== undefined) {
            let workspacefolder = vscode.workspace.workspaceFolders[0].uri.fsPath ; 
            this.debugHandler.log('info', `Found Workspacefolder in '${workspacefolder}'`);
            return workspacefolder;
        } 
        else {
            let message = "Working folder not found, open a folder an try again" ;
            this.debugHandler.log('error', message);
            throw new Error(message);
        }
    }

    

   
}