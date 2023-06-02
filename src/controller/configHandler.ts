import * as vscode from 'vscode';
import { DebugHandler } from './debugHandler';
import * as fs from 'fs';
import { ProxySettings } from '../models/proxySettings';
import { SushiSettings } from '../models/sushiSettings';
import os = require('os');

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
        buildSnapshots = this.isSectionDefined(buildSnapshots, section + '.BuildSnapshots');
        return new SushiSettings(buildSnapshots);
    }

    public getProxySettings(section: string): ProxySettings {
        let config = this.getActualConfiguration();
        let active = config.get<boolean>(section + '.enabled');
        let address = config.get<string>(section + '.ipAddress');
        active = this.isSectionDefined(active, section + '.enabled');
        address = this.isSectionDefined(address, section + '.ipAddress');
        return new ProxySettings(active, address);
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