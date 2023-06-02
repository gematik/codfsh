import * as vscode from 'vscode';
import { DebugHandler } from '../debugHandler';
import { FshParser } from './fshParser';
import fs = require('fs');
import { basename, join } from 'path';

export class FileConnector{

    fshParser : FshParser;
    debugHandler : DebugHandler;

    constructor(debugHandler : DebugHandler){
        this.debugHandler = debugHandler;
        this.fshParser = new FshParser();
    }

    public identifyGeneratedRessources(currentfile: vscode.Uri, ressourcesFolder: string) : string[] {
        let resultfiles : string[] = [];
        if(this.isGeneratedFile(currentfile)){
            this.debugHandler.log("info", "Added current file for Hapi validation: '" + currentfile.fsPath + "'");
            resultfiles.push(join(currentfile.fsPath));
            return resultfiles;
        }

        let foundIds = this.searchForIdsInFile(currentfile.fsPath);
        let files =  this.searchGeneratedFileWithId(foundIds, ressourcesFolder);

        if (resultfiles.length === 0){
            files.push(currentfile.fsPath);
            this.debugHandler.log("info", "Added current file for Hapi validation: '" + currentfile.fsPath + "'");
        }
        
        return files;
    }

    private searchGeneratedFileWithId(ids: string[],  ressourcesFolder: string): string[] {
        let resultfiles : string[] = [];
        let generatedFolder = join(ressourcesFolder,'fsh-generated','resources');
        let files = fs.readdirSync(generatedFolder);
        ids.forEach((id) => {
            files.forEach(file => {
                if(basename(file).includes(id.replace('"',""))){
                    const filepPath = join(generatedFolder,file);
                    this.debugHandler.log("info", "Found file which was generated from this file for Hapi Validation: '" + filepPath + "'");
                    resultfiles.push(filepPath);
                }
            });

        });
        return resultfiles;
    }


    private isGeneratedFile(currentfile: vscode.Uri) : boolean {
        return currentfile.path.indexOf("fsh-generated") > -1;
    }

    private searchForIdsInFile(currentfile: string) : string[] {
        let fshContent  = fs.readFileSync(join(currentfile), 'utf8');
        return this.fshParser.getIdsFromFshFile(fshContent);
    }
}