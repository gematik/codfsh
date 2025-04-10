import * as fs from 'fs';
import * as path from 'path';
import { DebugHandler } from '../debugHandler';
import { PathController } from '../pathController';
import { ProcessController } from '../processController';

export class FirelyWrapper {
    debugHandler: DebugHandler;
    pathController: PathController;
    processController: ProcessController;
    MAX_THREADS = 4;

    constructor(debugHandler: DebugHandler, pathController: PathController, processController: ProcessController) {
        this.debugHandler = debugHandler;
        this.pathController = pathController;
        this.processController = processController;
    }

    public async validateAll(resourceFolderPath: string): Promise<{ file: string; output: string }[]> {
        if (!fs.existsSync(resourceFolderPath)) {
            this.debugHandler.log("error", `Folder ${resourceFolderPath} does not exist.`, true);
            return [];
        }

        const files = fs.readdirSync(resourceFolderPath)
            .filter(f => f.endsWith('.json') || f.endsWith('.xml'))
            .map(f => path.join(resourceFolderPath, f));

        const results: { file: string; output: string }[] = [];
        let queue: Promise<void>[] = [];
        let activePromises: Promise<void>[] = [];

        for (const file of files) {
            const validationPromise = this.validateFile(file).then(output => {
                results.push({ file, output });
            }).catch(err => {
                this.debugHandler.log("error", `Validation failed for ${file}: ${err}`, true);
                results.push({ file, output: `Validation error: ${err}` });
            });

            activePromises.push(validationPromise);

            if (activePromises.length >= this.MAX_THREADS) {
                await Promise.all(activePromises);
                activePromises = [];
            }
        }

        await Promise.all(activePromises);
        return results;
    }

    private async validateFile(filePath: string): Promise<string> {
        this.debugHandler.log("info", `Validating ${filePath}...`);
        const args = ['validate', filePath];
        return this.processController.execShellCommandAsync('fhir', args, `codfsh: Firely (${path.basename(filePath)})`);
    }
}