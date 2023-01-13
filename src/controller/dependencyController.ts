import { Dependency } from "../models/dependency";
import * as vscode from 'vscode';
import { join } from 'path';
import yaml = require('js-yaml');
import fs = require('fs');
import { ConfigHandler } from "./configHandler";

export class DependencyController{

    sushiConfigPath: string;
    ressourcePath: string;

    constructor(configHandler: ConfigHandler){
        this.sushiConfigPath = configHandler.getFilePathFromConfig("HapiValidator.sushi-config.path");
        this.ressourcePath = configHandler.getFilePathFromConfig("RessourcesFolder");
    }

    public getDependenciesAsIgList() : string[] {
        let result: string[] = [];

        let dependencies = this.parseDependencies();
        dependencies.forEach((dependency) => {
            result.push(`-ig ${dependency.name}#${dependency.version}`);
        });

        let generatedFolderPath = this.getGeneratedFolderPath();
        result.push(`-ig ${generatedFolderPath}`);
        return result;
    }

    public parseDependencies() : Dependency[] {
        let config = this.parseConfig();
        let dependencies = [];
        if(config?.dependencies) {
            for (var file in config.dependencies) {
                dependencies.push(new Dependency(file,config.dependencies[file]));
            }
        }
        else
        {
            vscode.window.showInformationMessage('Warning: No dependencies found in ' + this.sushiConfigPath);
        }
        return dependencies;
    }

    private getGeneratedFolderPath() {
        return join(this.ressourcePath, 'fsh-generated','resources');
    }

    private parseConfig() : any{
        const doc = yaml.load(fs.readFileSync(this.sushiConfigPath, 'utf8'));
        return doc;
    }
}