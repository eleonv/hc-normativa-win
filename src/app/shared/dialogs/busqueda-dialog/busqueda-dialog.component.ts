import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ResponseComponent } from '../../../models/core/response-component';
import { Constante } from '../../../utility/constante';
import { SugerenciaDialogComponent } from '../sugerencia-dialog/sugerencia-dialog.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ChipItem } from '../../../models/core/chips';
@Component({
    selector: 'app-busqueda-dialog',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        FormsModule,
        MatInputModule,
        MatSelectModule,
        MatDividerModule,
        MatTooltipModule,
        MatTableModule,
        MatCheckboxModule
    ],
    templateUrl: './busqueda-dialog.component.html',
    styleUrl: './busqueda-dialog.component.scss'
})
export class BusquedaDialogComponent {
    _const = Constante;

    displayedColumns: string[] = ['check'];
    dataRaw: ChipItem[] = [];
    dataSelected: ChipItem[] = [];
    dataSource: any = new MatTableDataSource(this.dataRaw);

    dialogResult: ResponseComponent<any> = {
        status: this._const.DIALOG_STATUS_CANCEL,
        data: null
    };

    invalid: boolean = true;

    lTodo: boolean = false
    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialogRef: MatDialogRef<SugerenciaDialogComponent>,
        public dialog: MatDialog,
    ) {
        this.dataRaw = data.registros;

        this.dataSource = new MatTableDataSource<ChipItem>(this.dataRaw);
    }

    //#region Events
    onBusqueda(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    onCheckboxChangeAllSelect($event: any) {
        this.dataRaw.forEach((item: ChipItem) => {
            item.check = $event.checked;
        });

        const dat = this.dataRaw.filter((item: ChipItem) => item.check);

        if (dat.length > 0) this.invalid = false;
        else this.invalid = true;

        this.dataSelected = dat;
        this.lTodo = true
    }

    onCheckboxChangeOneSelect($event: any, item: ChipItem) {
        item.check = $event.checked;

        const dat = this.dataRaw.filter((item: ChipItem) => item.check);

        if (dat.length > 0) this.invalid = false;
        else this.invalid = true;

        this.dataSelected = dat;
        this.lTodo = false

    }

    onEnviar() {
        this.dialogResult.status = this._const.DIALOG_STATUS_OK,
            this.dialogResult.data = { selects: this.dataSelected, lTodo: this.lTodo };
        this.dialogRef.close(this.dialogResult);
    }
    //#endregion

    ngOnDestroy() {
        this.dialogRef.close(this.dialogResult);
    }
}




