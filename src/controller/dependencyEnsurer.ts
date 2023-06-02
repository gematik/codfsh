import { Dependency } from "../models/dependency";
import { DebugHandler } from "./debugHandler";
import { NotificationController } from "./notificationController";
import { ProcessController } from "./processController";

export class DependencyEnsurer{
    private debugHandler: DebugHandler;
    private processController : ProcessController;
    private notificationController: NotificationController;

    constructor(debugHandler: DebugHandler, processController : ProcessController){
        this.debugHandler = debugHandler;
        this.notificationController = new NotificationController(debugHandler);
        this.processController = processController;
    }

    public async installMissingDependencies(dependencies: Dependency[]): Promise<void>{
        const installedDependencies = await this.getInstalledDependencies();
        for (const dependency of dependencies) {
            if (installedDependencies.find(i => i.name === dependency.name && i.version === dependency.version)){
                this.debugHandler.log("info", `Package '${dependency.name}#${dependency.version}' already installed`);
            } else {
                if (await this.notificationController.surveyInstallMissingDependency(dependency)){
                    this.debugHandler.log("info", `Installing missing FHIR Package ${dependency.name}#${dependency.version}`, true);
                    const output = await this.installDependency(dependency);
                    this.debugHandler.log("info", output);
                }
            }
        }
    }

    private async installDependency(dependency: Dependency) : Promise<string>{
        try {
            this.debugHandler.log("info", `Started installation of package '${dependency.name}#${dependency.version}'`);
            const output = await this.processController.execShellCommandAsync("fhir", ['install', dependency.name, dependency.version], "codfsh: Firely Terminal");
            this.debugHandler.log("info", `Installation of package '${dependency.name}#${dependency.version}' finished!`);
            return output;
        } catch (e: any) {
            this.debugHandler.log("error", e.message);
            throw e;
        }
    }

    private async getInstalledDependencies() : Promise<Dependency[]> {
        try {
            const output = await this.processController.execShellCommandAsync("fhir", ['cache'], "codfsh: Firely Terminal");
            return this.parseInstalledDependencies(output);
        } catch (e: any) {
            this.debugHandler.log("error", e.message);
            throw e;
        }
    }

    private parseInstalledDependencies(output: string): Dependency[] {
        const regex = /(?<package>.+?)@(?<version>.*)/gm;
        let match: RegExpExecArray | null;
        const dependencies: Dependency[] = [] ;

        while ((match = regex.exec(output)) !== null) {
            if (match.index === regex.lastIndex) {
                regex.lastIndex++;
            }

            const packageName = match.groups?.package;
            const version = match.groups?.version;

            if (packageName && version) {
                const dependency = new Dependency(packageName, version);
                dependencies.push(dependency);
            }
        }

        return dependencies;
    }
}
