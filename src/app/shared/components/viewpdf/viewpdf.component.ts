import { Component, DestroyRef, HostListener } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { AppService } from '../../../services/core/app.service';
import { Constante } from '../../../utility/constante';
import { UserNormativaService } from '../../../services/user-normativa.service';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { AuthUtility } from '../../../utility/auth-utility';
import { ServService } from '../../../services/serv.service';
import { PDFDocumentProxy } from 'ng2-pdf-viewer';
@Component({
    selector: 'app-viewpdf',
    standalone: true,
    imports: [
        CommonModule,
        MatInputModule,
        MatIconModule,
        MatTooltipModule,
        MatSlideToggleModule,
        MatPaginatorModule,
        MatTableModule,
        MatButtonModule,
        RouterModule,
        MatMenuModule,
        MatDialogModule,
        PdfViewerModule,
        MatSidenavModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './viewpdf.component.html',
    styleUrl: './viewpdf.component.scss'
})
export class ViewpdfComponent {
    _const = Constante;

    rutaOrigen: string = "";
    normativaData: any = {};
    isLoadingResults = true;

    modoArchivo: number = 1;

    pdfSrc: any;
    nombreFile: string = "";

    heigthPdfViewer: number = 600;
    isZoomScalePageWidth: boolean = false;

    dataWindow: any
    lOpenWindow: boolean = false

    perfil: any = {};
    infoPdf: any = {};

    lImprimir: boolean = false
    lDescarga: boolean = false

    private pdf?: PDFDocumentProxy;

    constructor(
        private destroyRef: DestroyRef,
        private appService: AppService,
        private userNormativaService: UserNormativaService,
        private router: Router,
        private toastr: ToastrService,
        private servService: ServService,
        private route: ActivatedRoute,

    ) {
        this.perfil = AuthUtility.getPerfil();

    }
    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.ajustarVentana();
            this.obtenerDatosCompartido();
        });
    }


    ngAfterViewInit() { }

    //#region Methods
    obtenerDatosCompartido() {

        this.appService.getValueSharedData()
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe((data: any) => {
                if (data == null) {

                    const storedData = sessionStorage.getItem('dataWindow');
                    //this.lOpenWindow = true
                    if (storedData) {
                        //console.log('hay storage')
                        //console.log(storedData)
                        this.lOpenWindow = true
                        const dataWindow = JSON.parse(sessionStorage.getItem('dataWindow')!!);

                        this.infoPdf = {
                            idArchivo: dataWindow.normativa.idArchivo,
                            idNormativa: dataWindow.normativa.idNormativa
                        }
                        //this.dataWindow = data
                        this.rutaOrigen = dataWindow.rutaOrigen;
                        this.normativaData = dataWindow.normativa;

                        this.getDataArchivo(this.normativaData, this.modoArchivo);
                        this.obtenerPermisos(dataWindow.normativa.idNormativa)
                    }
                    else {
                        this.lOpenWindow = false
                        this.router.navigate([this._const.URL_DASHBOARD_HOME]);
                        return;
                    }

                } else {
                    //console.log('hay data')
                    //console.log(data)
                    this.infoPdf = {
                        idArchivo: data.normativa.idArchivo,
                        idNormativa: data.normativa.idNormativa
                    }
                    this.lOpenWindow = false
                    this.dataWindow = data
                    this.rutaOrigen = data.rutaOrigen;
                    this.normativaData = data.normativa;

                    this.getDataArchivo(this.normativaData, this.modoArchivo);
                    this.obtenerPermisos(data.normativa.idNormativa)

                }

            });
    }

    obtenerPermisos(idNormativa: any) {
        this.isLoadingResults = true;
        this.userNormativaService.obtenerPermisos(idNormativa)
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: any) => {
                    this.appService.disableLoading();
                    if (response.success == Constante.STATUS_OK) {
                        this.lDescarga = !!response.data.nOpcionDescarga
                        this.lImprimir = !!response.data.nOpcionImprime

                    } else {
                        this.toastr.warning(response.message, this._const.MESSAGE_TITLE_WARNING);
                    }
                },
            });
    }

    getDataArchivo(_normativaData: any, _modoArchivo: any) {
        this.appService.activateLoading();
        this.isLoadingResults = true;
        this.userNormativaService.getMetaDataArchivo(_normativaData, _modoArchivo)
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: any) => {
                    this.appService.disableLoading();
                    //console.log("Meta data file", response);

                    if (response.success == Constante.STATUS_OK) {

                        this.nombreFile = response.data.cNombre;
                        let _urlArchivo = response.data.cRuta;
                        this.getBytesArchivo(_urlArchivo);
                        sessionStorage.removeItem('dataWindow');


                    } else {
                        this.toastr.warning(response.message, this._const.MESSAGE_TITLE_WARNING);
                    }
                },
            });
    }

    getBytesArchivo(urlArchivo: string) {
        this.isLoadingResults = true;
        this.userNormativaService.getBytesArchivo(urlArchivo)
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: any) => {
                    const url = window.URL.createObjectURL(response);
                    this.pdfSrc = url;
                },
            });
    }


    ajustarVentana() {
        let widthW = window.innerWidth;
        let heightW = window.innerHeight;

        let _header = 64;
        let _footer = 56;
        let _padding = 20 * 2;
        let _titulo = 41;
        this.heigthPdfViewer = heightW - (_header + _footer + _padding + _titulo + 20);
    }

    openWindow() {
        //console.log(this.dataWindow)
        if (this.dataWindow) {
            sessionStorage.setItem('dataWindow', JSON.stringify(this.dataWindow));
            window.open('/normativas/verPdf/ver', '_blank', 'width=800,height=640');
        }
    }
    //#endregion

    //#region Events
    onDescargar(element: any) {

        let _normativaData = {
            idArchivo: element.idArchivo,
            idNormativa: element.idNormativa
        };

        let _modoArchivo = 2;

        this.servService.onDescargar(_normativaData, _modoArchivo);
    }

    onPrint() {
        this.pdf!!.getData().then((u8) => {
            let blob = new Blob([u8.buffer], {
                type: 'application/pdf'
            });

            const blobUrl = window.URL.createObjectURL((blob));
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = blobUrl;
            document.body.appendChild(iframe);
            iframe.contentWindow!!.print();
        });
    }

    onZoomScaleWitdh() {
        this.isZoomScalePageWidth = true;
    }

    onZoomScaleHeight() {
        this.isZoomScalePageWidth = false;
    }

    onLoadComplete($event: any) {
        this.pdf = $event;
        this.isLoadingResults = false;
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
        this.ajustarVentana();
    }

    onRegresar() {
        ////console.log("Ruta Origen", this.rutaOrigen);
        this.router.navigate([this.rutaOrigen]);
    }
    //#endregion
}
