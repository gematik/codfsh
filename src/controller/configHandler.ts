import * as vscode from 'vscode';
import { DebugHandler } from './debugHandler';
import * as fs from 'fs';
import { ProxySettings } from '../models/proxySettings';
import { SushiSettings } from '../models/sushiSettings';
import os = require('os');

export class ConfigHandler{
    debugHandler : DebugHandler;

    constructor(debugHandler : DebugHandler){
        this.debugHandler = debugHandler;
    }

    private getActualConfiguration() : vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration('codfsh');
    }

    public getFilePathFromConfig(section: string): string {
        let config = this.getActualConfiguration();
        let path =  config.get<string>(section);
        return this.check(path,section);
    }

    public getSushiSettings(section: string): SushiSettings {
        let config = this.getActualConfiguration();
        let buildSnapshots =  config.get<boolean>(section+'.BuildSnapshots');
        buildSnapshots = this.isBoolSectionDefined(buildSnapshots, section+'.BuildSnapshots');
        return new SushiSettings(buildSnapshots);
    }

    public getProxySettings(section: string) : ProxySettings {
        let config = this.getActualConfiguration();
        let active =  config.get<boolean>(section+'.enabled');
        let address =  config.get<string>(section+'.ipAddress');
        active = this.isBoolSectionDefined(active, section+'.enabled');
        address = this.isStringSectionDefined(address, section+'.ipAddress');
        return new ProxySettings(active,address);
    }

    private check(path: string | undefined, section: string) : string {
        if (path) {
            if (path.startsWith('~/')) {
                path = os.homedir() + path.substring(1);
            }
    
            path = this.isStringSectionDefined(path, section);
            if (!fs.existsSync(path)) {
                let error = "Specified " + section + " defined in the settings is incorrect. Path '" + path + "' does not exist.";
                this.debugHandler.log("error", error, true);
                throw new Error(error);
            }
        } else {
            let error = "Path is undefined for " + section;
            this.debugHandler.log("error", error, true);
            throw new Error(error);
        }
        return path;
    }
    

    private isStringSectionDefined(result: string | undefined, section: string) : string {
        if (result === undefined) {
            throw new Error(section + " is not defined in the settings of this extenion.");
        }
        return result;
    }

    private isBoolSectionDefined(result: boolean | undefined, section: string) : boolean {
        if (result === undefined) {
            throw new Error(section + " is not defined in the settings of this extenion.");
        }
        return result;
    }
}