import { Component, DestroyRef, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Pagination } from '../../../../models/core/pagination';
import { Constante } from '../../../../utility/constante';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { AppService } from '../../../../services/core/app.service';
import { ReporteService } from '../../../../services/reporte.service';
import { DateUtility } from '../../../../utility/date-utility';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
interface filtrOBJ {
    colName: string,
    name: string
}
@Component({
    selector: 'app-adm-usuario-list',
    standalone: true,
    imports: [
        MatInputModule,
        MatIconModule,
        MatPaginatorModule,
        MatTableModule,
        MatButtonModule,
        MatExpansionModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatSelectModule,
        CommonModule,
        MatSortModule
    ],
    templateUrl: './adm-usuario-list.component.html',
    styleUrl: './adm-usuario-list.component.scss'
})
export class AdmUsuarioListComponent {
    _const = Constante;
    tipoNormativa: number = -1;

    displayedColumns: string[] = ['cDNI', 'cNombreCompleto', 'cPerfil', 'cFechaRegistro', 'cArea', 'cAgencia', 'nCantidadIngresos'];
    listData: any = [];
    dataSource = new MatTableDataSource(this.listData);
    pagination: Pagination = new Pagination();

    @ViewChild(MatPaginator) paginator!: MatPaginator;

    @ViewChild('input') input!: ElementRef<HTMLInputElement>;

    areasRaw: any[] = [];
    tiposNormRaw: any[] = [];

    form = this.fb.group({
        cFechaInicio: new FormControl(new Date()),
        cFechaFin: new FormControl(new Date()),
    });

    filterSearch: any = {};
    filterSearchDefault: any = {};

    fechaDesde: Date | null = null;
    fechaHasta: Date | null = new Date();
    fechaHoy: Date = new Date();

    filtroLista: filtrOBJ[] = [
        { colName: 'cPerfil', name: 'Cargo' },
        { colName: 'cFechaRegistro', name: 'Ultima fecha de ingreso' },
        { colName: 'cArea', name: 'Gerencia' },
        { colName: 'cAgencia', name: 'Oficina' },
        { colName: 'nCantidadIngresos', name: 'Cantidad de ingresos' }
    ];

    filtros = new FormControl(this.filtroLista.map(f => f.colName));

    lResultados: boolean = false;
    searchDato: string = ''

    columnHeaders: Record<string, string> = {
        cDNI: "DNI",
        cNombreCompleto: "Nombre y Apellidos",
        cPerfil: "Cargo",
        cFechaRegistro: "Ultima fecha de ingreso",
        cArea: "Gerencia",
        cAgencia: "Oficina",
        nCantidadIngresos: "Cantidad de ingresos"
    };

    @ViewChild(MatSort) sort!: MatSort;

    constructor(
        private fb: FormBuilder,
        private destroyRef: DestroyRef,
        private appService: AppService,
        private reporteService: ReporteService,
        private toastr: ToastrService,
    ) {
        const dCurrentDate = new Date();
        const ageOneYear = new Date(dCurrentDate.getFullYear() - 1, dCurrentDate.getMonth(), dCurrentDate.getDate());
        this.fechaDesde = ageOneYear;

        this.pagination.nTotal = 0;
        this.pagination.pageIndex = 0;
        this.pagination.pageSize = this._const.PAGINATION_SIZE;

        let cCurrentDate = DateUtility.dateToString(dCurrentDate, 'YYYY-MM-DD');
        this.filterSearchDefault = {
            dCurrentDate: dCurrentDate,
            cFechaInicio: cCurrentDate,
            cFechaFin: cCurrentDate
        };

        this.filterSearch = structuredClone(this.filterSearchDefault);
        //this.listarRegistros();
    }

    get minDate() {
        return this.form.get('cFechaInicio')?.value;
    }

    get maxDate() {
        const startDate = this.form.get('cFechaInicio')?.value;
        return startDate && startDate && new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate()) < this.fechaHoy ? new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate()) : this.fechaHoy;
    }


    //#region Methods
    filterChange() {
        let auxDis: string[] = ['cDNI', 'cNombreCompleto'];
        if (this.filtros.value && this.filtros.value.length > 0) {
            auxDis = [...auxDis, ...this.filtros.value]
        }
        this.displayedColumns = auxDis
    }
    filtrarData(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }
    exportPdf() {
        let version = this.appService.getVersion();
        const doc = new jsPDF();

        const columns = this.displayedColumns.filter(col => this.columnHeaders[col]);
        const headers = columns.map(col => this.columnHeaders[col]);
        const filteredData = this.dataSource.filteredData;
        const sortedData = this.dataSource.sortData(filteredData, this.dataSource.sort!!);

        const rows = sortedData.map(item => {
            const dataItem = item as Record<string, any>;
            return this.displayedColumns.map(column => dataItem[column] ?? '');
        });

        const text = "Plataforma de Normativas " + version;
        const textWidth = doc.getTextWidth(text);
        const pageWidth = doc.internal.pageSize.width;
        const xPosition = (pageWidth - textWidth) / 2;
        doc.setFontSize(14);
        doc.text(text, xPosition, 15);
        autoTable(doc, {
            head: [headers],
            body: rows,
            theme: 'striped',
            styles: {
                fontSize: 8
            },
            headStyles: {
                fillColor: '#09233a',
                halign: 'center',
                valign: 'middle',
            },
            startY: 20
        });
        doc.save(text + '.pdf');
    }
    exportExcel(): void {
        if (this.dataSource != null) {
            let version = this.appService.getVersion();
            const text = "Plataforma de Normativas " + version;
            const columns = this.displayedColumns.filter(col => this.columnHeaders[col]);
            const columnHeadersS = columns.map(col => this.columnHeaders[col]);
            const rows = this.dataSource.filteredData.map(item => {
                const dataItem = item as Record<string, any>;
                return this.displayedColumns.map(column => dataItem[column] ?? '');
            });
            // const columnHeaders = this.displayedColumns;
            const filteredData = this.dataSource.filteredData;
            const sortedData = this.dataSource.sortData(filteredData, this.dataSource.sort!!);
            const dataToExport = sortedData.map((row: any) => {
                const rowData: any = [];
                let auxRow = {}
                this.displayedColumns.forEach((col: any) => {
                    auxRow = {
                        ...auxRow,
                        [this.columnHeaders[col]]: row[col]
                    }
                });
                return auxRow
            });
            const worksheet = XLSX.utils.json_to_sheet(dataToExport, { header: columnHeadersS });

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Datos");

            // Escribir el archivo
            XLSX.writeFile(workbook, text + '.xlsx');
        }
    }
    listarRegistros(): void {
        this.appService.activateLoading();
        this.reporteService.controlAccesos(this.pagination, this.filterSearch)
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: any) => {
                    this.appService.disableLoading();

                    if (response.success == Constante.STATUS_OK) {

                        if (Object.keys(response.data).length > 0) {
                            this.listData = response.data;
                            this.dataSource = new MatTableDataSource(this.listData);
                            this.dataSource.sort = this.sort;
                            //this.pagination.nTotal = response.data.objPaginacion.nTotal;
                            //this.pagination.pageIndex = response.data.objPaginacion.pageIndex;
                            this.pagination.nTotal = 0;
                            this.pagination.pageIndex = 0;
                            this.lResultados = true
                            this.input.nativeElement.value = '';
                        } else {
                            this.listData = [];
                            this.dataSource = new MatTableDataSource(this.listData);
                            this.dataSource.sort = this.sort;
                            this.pagination.nTotal = 0;
                            this.pagination.pageIndex = 0;
                            this.toastr.info(response.message, this._const.MESSAGE_TITLE_WARNING);
                            this.lResultados = false
                        }

                    } else {
                        this.toastr.warning(response.message, this._const.MESSAGE_TITLE_WARNING);
                    }
                },
            });

    }
    //#endregion

    //#region Event
    onPaginatorEvent(event: any) {
        //console.log(event);
        this.pagination.pageSize = event.pageSize;
        this.pagination.pageIndex = event.pageIndex;
        this.listarRegistros();
    }

    onLimpiarBusqueda() {
        this.form.reset();

        this.pagination.nTotal = 0;
        this.pagination.pageIndex = 0;
        this.pagination.pageSize = this._const.PAGINATION_SIZE;

        this.filterSearch = structuredClone(this.filterSearchDefault);

        this.form.get('cFechaInicio')?.setValue(this.filterSearch.dCurrentDate);
        this.form.get('cFechaFin')?.setValue(this.filterSearch.dCurrentDate);

        this.listarRegistros();
    }

    validarDiferencia() {
        const fechaDesde = this.form.get('cFechaInicio')!!.value;
        const fechaHasta = this.form.get('cFechaFin')!!.value;

        const diferenciaDias = (new Date(fechaHasta!!).getTime() - new Date(fechaDesde!!).getTime()) / (1000 * 3600 * 24);

        //console.log(diferenciaDias)
        return diferenciaDias <= 366 ? true : false;
    }
    onChangeDesde() {
        const startDate = this.form.get('cFechaInicio')?.value;
        let newDate = startDate && new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate()) < this.fechaHoy ? new Date(startDate.getFullYear() + 1, startDate.getMonth(), startDate.getDate()) : this.fechaHoy;
        this.form.get('cFechaFin')?.setValue(newDate);
    }
    onListarPorBusqueda() {
        const _dFechaInicio: any = this.form.get('cFechaInicio')?.value;
        const _dFechaFin: any = this.form.get('cFechaFin')?.value;
        // if (!this.validarDiferencia())
        //     return

        //console.log('paso validacion')
        const _cFechaInicio = DateUtility.dateToString(_dFechaInicio, 'YYYY-MM-DD');
        const _cFechaFin = DateUtility.dateToString(_dFechaFin, 'YYYY-MM-DD');

        this.filterSearch = {
            cFechaInicio: _cFechaInicio,
            cFechaFin: _cFechaFin,
        };

        this.pagination.nTotal = 0;
        this.pagination.pageIndex = 0;
        this.pagination.pageSize = this._const.PAGINATION_SIZE;

        this.listarRegistros();
    }
    //#endregion
}
