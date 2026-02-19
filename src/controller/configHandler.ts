import * as vscode from 'vscode';
import { DebugHandler } from './debugHandler';
import * as fs from 'fs';
import { SushiSettings } from '../models/sushiSettings';
import os = require('os');
import * as yaml from 'js-yaml';

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

    public getSushiSettings(section: string): SushiSettings {
        let config = this.getActualConfiguration();
        let buildSnapshots = config.get<boolean>(section + '.BuildSnapshots');
        let checkPackages = config.get<boolean>(section + '.CheckPackages');
        buildSnapshots = this.isSectionDefined(buildSnapshots, section + '.BuildSnapshots');
        checkPackages = this.isSectionDefined(checkPackages, section + '.CheckPackages');
        return new SushiSettings(buildSnapshots, checkPackages);
    }

    public getHapiParameters(section: string): any {
        // Get settings from yaml file
        let settingsFileParameters = this.getParametersFromSettingsFile(section + '.SettingsFile');
    
        // Get additional parameters from configuration
        let config = this.getActualConfiguration();
        let additionalParameter = config.get<string>(section + '.AdditionalParameters');
    
        // Create an object with the additional parameter
        let additionalParametersObj: { [key: string]: string | boolean } = {};
        if (additionalParameter) {
            let splitParameters = additionalParameter.split(' ');
            for (let i = 0; i < splitParameters.length; i++) {
                // If parameter starts with '-', it's a key
                if (splitParameters[i].startsWith('-')) {
                    let key = splitParameters[i].substring(1);
                    // If next parameter also starts with '-', or does not exist, set current key to true
                    if (i + 1 === splitParameters.length || splitParameters[i + 1].startsWith('-')) {
                        additionalParametersObj[key] = true;
                    } else {
                        // Else set it to the next parameter (its value)
                        additionalParametersObj[key] = splitParameters[i + 1];
                        i++; // Skip next parameter since it's used as value
                    }
                }
            }
        }
        
    
        // Merge parameters with the additionalParameter being given preference
        return {...settingsFileParameters, ...additionalParametersObj};
    }

    public getParametersFromSettingsFile(section: string): any {
        let config = this.getActualConfiguration();
        let filePath = config.get<string>(section);
        if(filePath) {
            try {
                let fileContents = fs.readFileSync(filePath, 'utf8');
                let data: any = yaml.load(fileContents);
                return data.hapi_parameters;
            } catch (e) {
                this.debugHandler.log("error",`Error reading or parsing YAML file from '${filePath}'`);
                return {};
            }
        } else { 
            this.debugHandler.log("info",`The location of an optional YAML file for reading additional parameters is not set in the settings of the extension under '${section}'`);
            return {};
        }
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

    private isSectionDefined<T>(result: T | undefined, section: string): T {
        if (result === undefined) {
            throw new Error(section + " is not defined in the settings of this extenion.");
        }
        return result;
    }
}