"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workspaceFileAccessor = exports.activateMockDebug = void 0;
const vscode = require("vscode");
const vscode_1 = require("vscode");
function activateMockDebug(context, factory) {

    context.subscriptions.push(vscode.commands.registerCommand('extension.fsh-validator.getProgramName', config => {
        var f = vscode.window.activeTextEditor?.document.uri;
        let diagnosticCollection;
        // array per file in Map (aka. folder)
        let diagnostics = Array();
        vscode.window.showInformationMessage('Hallo Robert, du hast F5 gedrückt');

        // 1. run sushi
        console.info('### run some sushi Resources');
        // 2. filter sushi errors
        console.info('### IF sushi error then ADD problem');
        if (f) {
            let range = new vscode.Range(4, 1, 4, 6);
            let d = new vscode_1.Diagnostic(range, "Hallo Problem-Robert", vscode.DiagnosticSeverity.Error);
            diagnostics.push(d);
            diagnosticCollection = vscode.languages.createDiagnosticCollection('fsh');
            diagnosticCollection.set(f, diagnostics);
        }
        // 3. run validator
        console.info('### RUN hapi validator for dedicated sushi-output-file ' + f + '.JSON');
        // 4. filter HAPI validation errors
        console.info('### IF validation error then ADD more problems');
    }));

    // register a configuration provider for 'mock' debug type
    const provider = new MockConfigurationProvider();
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('mock', provider));
    // register a dynamic configuration provider for 'mock' debug type
    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('mock', {
        provideDebugConfigurations(folder) {
            return [
                {
                    name: "Dynamic Launch",
                    request: "launch",
                    type: "mock",
                    program: "${file}"
                },
                {
                    name: "Another Dynamic Launch",
                    request: "launch",
                    type: "mock",
                    program: "${file}"
                },
                {
                    name: "Mock Launch",
                    request: "launch",
                    type: "mock",
                    program: "${file}"
                }
            ];
        }
    }, vscode.DebugConfigurationProviderTriggerKind.Dynamic));

    // override VS Code's default implementation of the "inline values" feature"
    context.subscriptions.push(vscode.languages.registerInlineValuesProvider('markdown', {
        provideInlineValues(document, viewport, context) {
            const allValues = [];
            // Hendrik was here
            console.log('what a feature');
            for (let l = viewport.start.line; l <= context.stoppedLocation.end.line; l++) {
                const line = document.lineAt(l);
                var regExp = /\$([a-z][a-z0-9]*)/ig; // variables are words starting with '$'
                do {
                    var m = regExp.exec(line.text);
                    if (m) {
                        const varName = m[1];
                        const varRange = new vscode.Range(l, m.index, l, m.index + varName.length);
                        // some literal text
                        //allValues.push(new vscode.InlineValueText(varRange, `${varName}: ${viewport.start.line}`));
                        // value found via variable lookup
                        allValues.push(new vscode.InlineValueVariableLookup(varRange, varName, false));
                        // value determined via expression evaluation
                        //allValues.push(new vscode.InlineValueEvaluatableExpression(varRange, varName));
                    }
                } while (m);
            }
            return allValues;
        }
    }));
}
exports.activateMockDebug = activateMockDebug;
class MockConfigurationProvider {
    /**
     * Massage a debug configuration just before a debug session is being launched,
     * e.g. add all missing attributes to the debug configuration.
     */
    resolveDebugConfiguration(folder, config, token) {

        if (!config.program) {
            return vscode.window.showInformationMessage("Cannot find a program to debug").then(_ => {
                return undefined; // abort launch
            });
        }
        return config;
    }
}
exports.workspaceFileAccessor = {
    isWindows: false,
    async readFile(path) {
        let uri;
        try {
            uri = pathToUri(path);
        }
        catch (e) {
            return new TextEncoder().encode(`cannot read '${path}'`);
        }
        return await vscode.workspace.fs.readFile(uri);
    },
    async writeFile(path, contents) {
        await vscode.workspace.fs.writeFile(pathToUri(path), contents);
    }
};
function pathToUri(path) {
    try {
        return vscode.Uri.file(path);
    }
    catch (e) {
        return vscode.Uri.parse(path);
    }
}
/*
class InlineDebugAdapterFactory implements vscode.DebugAdapterDescriptorFactory {

    createDebugAdapterDescriptor(_session: vscode.DebugSession): ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new MockDebugSession(workspaceFileAccessor));
    }
}
*/
//# sourceMappingURL=activateFshDebug.js.map