import { Dependency } from "../models/dependency";
import { DebugHandler } from "./debugHandler";
import { NotificationController } from "./notificationController";
import { ProcessController } from "./processController";

export class DependencyEnsurer{
    debugHandler: DebugHandler;
    processController : ProcessController;
    notificationController: NotificationController;

    constructor(debugHandler: DebugHandler, processController : ProcessController){
        this.debugHandler = debugHandler;
        this.notificationController = new NotificationController(debugHandler);
        this.processController = processController;
    }

    public async installMissingDependencies(dependencies: Dependency[]){
        let installedDependencies = await this.getInstalledDependencies(); 
        for (const dependency of dependencies) {
            if (installedDependencies.filter(i => i.name === dependency.name && i.version === dependency.version)){
                this.debugHandler.log("info", `Package '${dependency.name}#${dependency.version}' already installed`);
            }
            else
            {
                if (await this.notificationController.surveyInstallMissingDependency(dependency)){
                    this.debugHandler.log("info", `Installing missing FHIR Package ${dependency.name}#${dependency.version}`, true);
                    let output = await this.installDependency(dependency);
                    this.debugHandler.log("info", output);
                }                
            }
        }
    }

    private async installDependency(dependency: Dependency) : Promise<string>{
        return new Promise(async (resolve, reject) => {
            try {
                this.debugHandler.log("info", `Started installation of package '${dependency.name}#${dependency.version}'`);
                const output = await this.processController.execShellCommandAsync("fhir", ['install', dependency.name, dependency.version], "Firely Terminal");
                this.debugHandler.log("info", `Installation of package '${dependency.name}#${dependency.version}' finished!`);
                resolve(output);
            }
            catch (e: any) {
                this.debugHandler.log("error", e);
                reject(e);
            }
        });
    }

    private async getInstalledDependencies() : Promise<Dependency[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const output = await this.processController.execShellCommandAsync("fhir", ['cache'], "Firely Terminal");
                const dependencies = this.parseDependencies(output);            
                resolve(dependencies);
            }
            catch (e: any) {
                this.debugHandler.log("error", e);
                reject(e);
            }
        });
    }

    private parseDependencies(output: string): Dependency[] {
        const regex = /(?<package>.+?)@(?<version>.*)/gm;
        let m;
        let dependencies = [] ;
        while ((m = regex.exec(output)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            if (m.groups?.package) {
                let dependency = new Dependency(m.groups?.package, m.groups?.version);
                dependencies.push(dependency);
            }
           
        }
        return dependencies;
    }
   
}