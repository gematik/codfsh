export class ProxySettings{

    active : boolean;
    address: string;

    constructor(active: boolean, address: string){
        this.active = active;
        this.address = address;
    }
}