export class ChipItem {
    id: number;
    name: string;
    check: boolean;
    subtitulo?: string;
    lsubTitulo?: boolean

    constructor() {
        this.id = 0;
        this.name = "";
        this.check = false;
    }
}
