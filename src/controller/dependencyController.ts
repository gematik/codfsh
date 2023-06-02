import * as vscode from 'vscode';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

import { DebugHandler } from "./debugHandler";
import { PathController } from "./pathController";

import { Dependency } from "../models/dependency";
import { PathValues } from "../models/pathValues";

export class DependencyController {
    private debugHandler: DebugHandler;
    private pathController: PathController;

    constructor(debugHandler: DebugHandler, pathController: PathController) {
        this.debugHandler = debugHandler;
        this.pathController = pathController;
    }

    public async getDependenciesAsIgList(pathValues: PathValues): Promise<string[]> {
        const dependencies = this.parseDependencies(pathValues.sushiConfigPath);
        const generatedFolderPath = this.getGeneratedFolderPath(pathValues.ressourceFolderPath);

        return [
            ...dependencies.map(dependency => `-ig ${dependency.name}#${dependency.version}`),
            `-ig ${generatedFolderPath}`
        ];
    }

    public parseDependencies(sushiConfigPath: string): Dependency[] {
        const config = this.parseConfig(sushiConfigPath);
    
        if (!config?.dependencies) {
            vscode.window.showInformationMessage('Warning: No dependencies found in ' + sushiConfigPath);
            return [];
        }
    
        return Object.entries(config.dependencies).map(([file, dep]) => {
            const version = typeof dep === 'object' && dep !== null && 'version' in dep ? dep.version : dep;
            return new Dependency(file, String(version));
        });
    }

    private getGeneratedFolderPath(ressourceFolderPath: string): string {
        return join(ressourceFolderPath, 'fsh-generated', 'resources');
    }

    private parseConfig(sushiConfigPath: string): any {
        return yaml.load(fs.readFileSync(sushiConfigPath, 'utf8'));
    }
}
