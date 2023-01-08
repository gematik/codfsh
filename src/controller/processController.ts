export class ProcessController{

    public execShellCommand(cmd: string) : Promise<string>{
        const exec = require('child_process').exec;
        return new Promise((resolve, reject) => {
            exec(cmd, (error: any, stdout: string, stderr: string) => {
            if (error) {
                console.log(error);
                //reject(new Error(error));
            }
            resolve(stdout);
            });
        });
    }
}