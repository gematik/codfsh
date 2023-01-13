import * as vscode from 'vscode';


export class ErrorHandler{
      public handleError(error: any) {
        vscode.window.showErrorMessage(error, ...['Ok', 'Resolve']).then(selection => {
            //TODO: Make specific Errors resolve able for example by downloaded missing dependencies
            console.log(selection);
        });
    }
}