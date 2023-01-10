import { Dependency } from "../models/dependency";
import * as vscode from 'vscode';

import yaml = require('js-yaml');
import fs = require('fs');

export class DependencyController{

    sushiConfigPath: string;

    constructor(sushiConfigPath: string){
        this.sushiConfigPath = sushiConfigPath;
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

    private parseConfig() : any{
        const doc = yaml.load(fs.readFileSync(this.sushiConfigPath, 'utf8'));
        return doc;
    }
}