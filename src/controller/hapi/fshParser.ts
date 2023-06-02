export class FshParser {
    public getIdsFromFshFile(fshContent: string): string[] {
        const regex = /(I|i)d\s*(:|=)\s*"*(?<id>.*)"*/gm;
        const output: string[] = [];

        let match: RegExpExecArray | null;
        while ((match = regex.exec(fshContent)) !== null) {
            if (match.groups?.id) {
                output.push(match.groups.id);
            }
        }

        return output;
    }
}