import * as vscode from 'vscode';
import * as fs from 'fs';
import { ProxySettings } from '../models/proxySettings';

export class ConfigHandler{
    
    config: vscode.WorkspaceConfiguration;
    
    constructor(){
        this.config = vscode.workspace.getConfiguration('codfsh');
    }
    
    public getFilePathFromConfig(section: string): string {
        let path =  this.config.get<string>(section);
        return this.check(path,section);
    }
    
    public getProxySettings(section: string) : ProxySettings {
        let active =  this.config.get<boolean>(section+'.enabled');
        let address =  this.config.get<string>(section+'.ipAddress');
        active = this.isBoolSectionDefined(active, section+'.enabled');
        address = this.isStringSectionDefined(address, section+'.ipAddress');
        return new ProxySettings(active,address);
    }
    
    private check(path: string | undefined, section: string) : string {
        path = this.isStringSectionDefined(path, section);
        if (!fs.existsSync(path)) {
            throw new Error("Specified " + section + " defined in the settings is incorrect.");
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