import { HapiParameter } from "../../models/hapiParameter";
import { Dependency } from "../../models/dependency";
import { ProcessController } from "../processController";
import { ProxySettings } from "../../models/proxySettings";
const yaml = require('js-yaml');
const fs   = require('fs');

export class HapiWrapper{

    processController : ProcessController;
    validatorDestination : string;
    sushiConfigDestination: string;
    proxyConfigDestination: string;

    constructor(validatorDestination: string, sushiConfigDestination: string, proxyConfigDestination: string){
        this.validatorDestination = validatorDestination;
        this.sushiConfigDestination = sushiConfigDestination;
        this.proxyConfigDestination = proxyConfigDestination;
        this.processController = new ProcessController();
    }

    public async getConsoleOutput(fileToValidate: string) : Promise<string>  {
        return new Promise((resolve, reject) => {
            this.getParameter().then((params: HapiParameter) => {
                let cmd = `java -jar ${this.validatorDestination} ${params.version} ${params.dependencies.join(" ")} ${fileToValidate}`;
                console.log(cmd);
                let output = this.processController.execShellCommand(cmd);
                console.log(output);
                resolve(output);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    private getParameter(): Promise<HapiParameter> {
        return new Promise((resolve, reject) => {
            let dependencies = this.formatDepencencies(this.getDependencies());
            let proxy = this.formatProxySettiungs(this.getProxySettings());
            resolve(new HapiParameter(dependencies, proxy));
        });
        
    }


    formatProxySettiungs(settings: ProxySettings) : string {
        if (settings.active) {
            return `-proxy ${settings.address}`;
        }
        return "";
    }

    getProxySettings(): ProxySettings {
        let config = this.parseConfig(this.proxyConfigDestination);
        console.log(config);
        //TODO: Parse dependencies
        return new ProxySettings(true, "192.168.110.10:3128");
    }

    private formatDepencencies(dependencies: Dependency[]) : string[] {
        let result : string[] = []; 
        dependencies.forEach((dependency) => {
            result.push(`-ig ${dependency.name}#${dependency.version}`);
        });
        return result;
    }

    private getDependencies() : Dependency[] {
        let config = this.parseConfig(this.sushiConfigDestination);
        console.log(config);
        //TODO: Parse dependencies
        let dependencies = [];
        dependencies.push(new Dependency("hl7.fhir.r4.core","4.0.1"));
        dependencies.push(new Dependency("de.basisprofil.r4","1.4.0"));
        dependencies.push(new Dependency("de.gematik.erezept-workflow.r4","1.2.0"));
        dependencies.push(new Dependency("de.gematik.fhir.directory","0.9.0"));
        dependencies.push(new Dependency("kbv.basis","1.3.0"));
        dependencies.push(new Dependency("kbv.ita.for","1.1.0"));
        dependencies.push(new Dependency("kbv.ita.erp","1.1.0"));
        return dependencies;
    }

    private parseConfig(configDestination: string) {
        try {
            const doc = yaml.load(fs.readFileSync(configDestination, 'utf8'));
            console.log(doc);
          } catch (e) {
            console.log(e);
          }
    }
}