import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, EventEmitter, Input, Output, SimpleChanges, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { ResponseComponent } from '../../../models/core/response-component';
import { Constante } from '../../../utility/constante';
import { BusquedaDialogComponent } from '../../dialogs/busqueda-dialog/busqueda-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { ChipItem } from '../../../models/core/chips';
import { NgClass } from '@angular/common';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
@Component({
    selector: 'app-multipleselect',
    standalone: true,
    imports: [
        MatFormFieldModule,
        MatChipsModule,
        MatIconModule,
        MatAutocompleteModule,
        FormsModule,
        MatButtonModule,
        NgClass,
        MatCheckboxModule
    ],
    templateUrl: './multipleselect.component.html',
    styleUrl: './multipleselect.component.scss'
})
export class MultipleselectComponent {
    _const = Constante;

    @Output() result = new EventEmitter<ResponseComponent<any>>();
    @Input() selectedItems = signal<any[]>([]);
    @Input() datasource: ChipItem[] = [];
    @Input() disabled: boolean = false;
    @Input() config = { label: 'Label', button: 'Add' };
    @Input() lTodosButton?: boolean = false;
    @Input() lTodosSelect?: boolean = false;

    lTodosActive: boolean = false;
    //readonly separatorKeysCodes = [ENTER, COMMA] as const;
    readonly separatorKeysCodes = [] as const;
    readonly announcer = inject(LiveAnnouncer);

    constructor(
        public dialog: MatDialog,
    ) {
    }

    ngOnInit() {
        ////console.log('llego', this.lTodosSelect)
        //console.log('pintando')

        if (this.lTodosSelect) {
            this.onTodosSelected({ checked: true } as MatCheckboxChange)
        }
    }


    ngOnChanges(changes: SimpleChanges) {
        if (changes['lTodosSelect'] && changes['lTodosSelect'].currentValue !== changes['lTodosSelect'].previousValue && changes['lTodosSelect'].previousValue != undefined) {
            {
                this.resetComponent();
            }
        }
    }

    resetComponent() {
        this.onTodosSelected({ checked: this.lTodosSelect } as MatCheckboxChange)
    }

    //#region Metodos
    //#endregion

    //#region Eventos
    onRemove(item: any): void {
        if (item.id = -1) {
            this.lTodosActive = false

        }
        this.selectedItems.update(x => {
            const index = x.indexOf(item);
            if (index < 0) {
                return x;
            }

            x.splice(index, 1);
            this.announcer.announce(`Removed ${item.name}`);
            return [...x];
        });

        let resultCpm: ResponseComponent<ChipItem[]> = {
            status: this._const.STATUS_OK,
            data: this.selectedItems()
        };

        this.result.emit(resultCpm);
    }

    onShowModalAdd() {

        this.datasource = this.datasource.map((item: any) => {
            return { id: item.id, name: item.name, check: false, subtitulo: item.subtitulo ?? '',lsubTitulo: item.lsubTitulo  };
        });

        this.dialog.open(BusquedaDialogComponent, { width: '950px', height: '550px', data: { registros: this.datasource } })
            .afterClosed().subscribe((response: ResponseComponent<any>) => {
                if (response.status == this._const.DIALOG_STATUS_OK) {

                    let listData: ChipItem[] = response.data.selects;
                    if (response.data.lTodo && this.lTodosButton) {
                        this.onTodosSelected({ checked: true } as MatCheckboxChange)

                    } else {
                        let _lstSeleccionados = this.selectedItems();
                        if (listData.length > 0) {
                            listData.forEach((x: ChipItem) => {

                                const index = _lstSeleccionados.findIndex((obj) => obj.id === x.id)
                                if (index < 0)
                                    this.selectedItems.update(item => [...item, { id: x.id, name: x.name, check: x.check, subtitulo: x.subtitulo ?? '', lsubTitulo: x.lsubTitulo }]);
                            });
                        }

                        let resultCpm: ResponseComponent<ChipItem[]> = {
                            status: this._const.STATUS_OK,
                            data: this.selectedItems()
                        };

                        this.result.emit(resultCpm);
                    }


                }
            });
    }
    onTodosSelected(event: MatCheckboxChange) {
        this.lTodosActive = event.checked
        this.selectedItems.set([])
        if (this.lTodosActive) {
            this.selectedItems.update(item => [...item, { id: -1, name: 'TODO', check: true }]);
        }
        let resultCpm: ResponseComponent<ChipItem[]> = {
            status: this._const.STATUS_OK,
            data: this.selectedItems()
        };
        this.result.emit(resultCpm);


    }
    onRemoveTodo() {
    }
    //#endregion
}
