import * as vscode from 'vscode';
import { DebugHandler } from './debugHandler';
import * as fs from 'fs';
import { SushiParameters } from '../models/sushiSettings';
import os = require('os');
import * as yaml from 'js-yaml';
import path = require('path');
import { error } from 'console';

export class ConfigHandler {
    debugHandler: DebugHandler;

    constructor(debugHandler: DebugHandler) {
        this.debugHandler = debugHandler;
    }

    private getActualConfiguration(): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration('codfsh');
    }

    public getFilePathFromConfig(section: string): string {
        let config = this.getActualConfiguration();
        let path = config.get<string>(section);
        return this.resolveAndValidatePath(path, section);
    }

    public getSushiSettings(section: string): SushiParameters {
        let config = this.getActualConfiguration();
        let buildSnapshots = config.get<boolean>(section + '.BuildSnapshots');
        buildSnapshots = this.isSectionDefined(buildSnapshots, section + '.BuildSnapshots');
        // TODO: read sushi settings from global and local config file
        return new SushiParameters(buildSnapshots);
    }

    public isLocalProjectSettingsFileActive(): boolean {
        return this.isSectionDefined(this.getActualConfiguration().get<boolean>("Settings.UseProjectSettingFiles"), "Settings.UseProjectSettingFiles");
    }

    public getHapiParametersFromExtensionConfig(): any {
        const config = this.getActualConfiguration();
        const globalSettingsFileParameters = this.getParametersFromGlobalSettingsFile("Settings.SettingsFile");
        const additionalParameter = config.get<string>("HapiValidator.Settings" + '.AdditionalParameters');
    
        const additionalParametersObj: { [key: string]: string | boolean } = additionalParameter ? this.parseAdditionalParameters(additionalParameter) : {};
    
        return { ...globalSettingsFileParameters, ...additionalParametersObj };
    }

    private parseAdditionalParameters(additionalParameter: string) {
        return additionalParameter.split(' ').reduce((obj, param, i, params) => {
            if (param.startsWith('-')) {
                const key = param.substring(1);
                obj[key] = (i + 1 === params.length || params[i + 1].startsWith('-')) ? true : params[i + 1];
            }
            return obj;
        }, {} as { [key: string]: string | boolean });
    }
    

    public getSettingsFromYamlFile(filePath: string | undefined, yamlProperty: string): any {
        if (!filePath) {
            this.debugHandler.log("info", "The location of an optional YAML file for reading additional parameters is not set in the settings.");
            return {};
        }
    
        try {
            const fileContents = fs.readFileSync(filePath, 'utf8');
            const data: any = yaml.load(fileContents);
            return data.hapi[yamlProperty];
        } catch (e) {
            this.debugHandler.log("error", `Error reading or parsing YAML file from '${filePath}' Error: '${e}'`);
            return {};
        }
    }
    
    public getParametersFromSettingsFile(filePath: string | undefined): any {
        return this.getSettingsFromYamlFile(filePath, "parameters");
    }
    
    public getIgnoredDiagnosticsFromSettingsFile(filePath: string | undefined): any {
        return this.getSettingsFromYamlFile(filePath, "ignore");
    }
    
    public getParametersFromGlobalSettingsFile(section: string): any {
        let config = this.getActualConfiguration();
        let filePath = config.get<string>(section);
    
        if (filePath === undefined) {
            this.debugHandler.log("info", `Configuration section not set '${section}' to read from global YAML config file`);
            return {};
        }
    
        filePath = this.expandHomeDir(filePath);
    
        return this.getParametersFromSettingsFile(filePath);
    }
    
    public getParametersFromLocalSettingsFile(filePath: string): any {
        return this.getParametersFromSettingsFile(filePath);
    }
    

    private resolveAndValidatePath(path: string | undefined, section: string): string {
        if (path) {
            path = this.resolveHomeDir(path);
            path = this.isSectionDefined(path, section);
    
            if (!fs.existsSync(path)) {
                this.debugHandler.log("error","Specified " + section + " defined in the settings is incorrect. Path '" + path + "' does not exist.", true);
            }
            return path;
        } else {
            this.debugHandler.log("error","Path is undefined for " + section, true);
        }
        throw new Error(`Unexpected error resolving path for ${section}`);
    }
    

    private resolveHomeDir(path: string): string {
        if (path.startsWith('~/')) {
            path = os.homedir() + path.substring(1);
        }
        return path;
    }

    private expandHomeDir(filePath: string) {
        if (filePath.startsWith('~')) {
            return path.join(os.homedir(), filePath.slice(1));
        }
        return filePath;
    }

    private isSectionDefined<T>(result: T | undefined, section: string): T {
        if (result === undefined) {
            throw new Error(section + " is not defined in the settings of this extenion.");
        }
        return result;
    }
}