import { DebugHandler } from "./debugHandler";
import { Dependency } from "../models/dependency";
import * as vscode from 'vscode';
import { join } from 'path';
import yaml = require('js-yaml');
import fs = require('fs');
import { PathController } from "./pathController";
import { PathValues } from "../models/pathValues";

export class DependencyController{

    pathController: PathController;
    debugHandler : DebugHandler;


    constructor(debugHandler : DebugHandler, pathController: PathController){
        this.debugHandler = debugHandler;
        this.pathController = pathController;
    }

    public async getDependenciesAsIgList(pathValues: PathValues) : Promise<string[]> {
        let result: string[] = [];
        let dependencies = this.parseDependencies(pathValues.sushiConfigPath);
        dependencies.forEach((dependency) => {
            result.push(`-ig ${dependency.name}#${dependency.version}`);
        });
        let generatedFolderPath = this.getGeneratedFolderPath(pathValues.ressourceFolderPath);
        result.push(`-ig ${generatedFolderPath}`);

        return result;
    }

    public parseDependencies(sushiConfigPath: string) : Dependency[] {
            let config = this.parseConfig(sushiConfigPath);
            let dependencies = [];
            if(config?.dependencies) {
                for (var file in config.dependencies) {
                    if(Object.prototype.toString.call(config.dependencies[file]) === '[object Object]') {
                         dependencies.push(new Dependency(file,config.dependencies[file].version));
                    }else{
                         dependencies.push(new Dependency(file,config.dependencies[file]));
                    }

                }
            }
            else
            {
                vscode.window.showInformationMessage('Warning: No dependencies found in ' + sushiConfigPath);
            }
            return dependencies;
    }

    private getGeneratedFolderPath(ressourceFolderPath: string) {
        return join(ressourceFolderPath, 'fsh-generated','resources');
    }

    private parseConfig(sushiConfigPath: string) : any{
        const doc = yaml.load(fs.readFileSync(sushiConfigPath, 'utf8'));
        return doc;
    }
}