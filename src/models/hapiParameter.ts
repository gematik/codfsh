export class HapiParameter{
    version: string = "-version 4.0.1"; // FHIR Version to use
    dependencies : string[];
    proxy: string;

    constructor(dependencies : string[], proxy: string){
        this.dependencies = dependencies;
        this.proxy = proxy;
    }



}