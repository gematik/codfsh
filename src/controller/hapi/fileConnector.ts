import * as vscode from 'vscode';
import { FshParser } from './fshParser';
import fs = require('fs');
import { basename, join } from 'path';

export class FileConnector{

    fshParser : FshParser;
    ressourcesFolder : string;

    constructor(ressourcesFolder: string){
        this.fshParser = new FshParser();
        this.ressourcesFolder = ressourcesFolder;
    }

    public identifyGeneratedRessources(currentfile: vscode.Uri) : string[] {
        let resultfiles : string[] = [];
        if(this.isGeneratedFile(currentfile)){
            resultfiles.push(currentfile.path);
            return resultfiles;
        }

        let foundIds = this.searchForIdsInFile(currentfile.path);
        let files =  this.searchGeneratedFileWithId(foundIds);
        console.log(files);
        return files;
    }

    private searchGeneratedFileWithId(ids: string[]): string[] {
        let resultfiles : string[] = [];
        let ressourcesFolder = join(this.ressourcesFolder,'fsh-generated','resources');
        let files = fs.readdirSync(ressourcesFolder);
        ids.forEach((id) => {
            files.forEach(file => {
                if(basename(file).includes(id.replace('"',""))){
                    console.log("found:" + join(ressourcesFolder,file));
                    resultfiles.push(join(ressourcesFolder,file));
                }
            });

        });
        if (resultfiles.length === 0){
            throw new Error("Unable to identify generated files from this file.");
        }

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