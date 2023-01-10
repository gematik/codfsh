export class FshParser{
    public getIdsFromFshFile(fshContent: string) : string[] {

        const regex = /(I|i)d\s*(:|=)\s*"*(?<id>.*)"*/gm;
        let m;
        let output : string[] = [] ;

        while ((m = regex.exec(fshContent)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
            if(m.groups){
                output.push(m.groups.id);
            }
        }
        return output;

    }
}