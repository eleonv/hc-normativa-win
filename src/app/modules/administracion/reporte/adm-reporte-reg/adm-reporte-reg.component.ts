import { Component, DestroyRef, signal, SimpleChanges } from '@angular/core';
import { ReactiveFormsModule, Validators, FormBuilder, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AppService } from '../../../../services/core/app.service';
import { Constante } from '../../../../utility/constante';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ArchivoComponent } from '../../../../shared/components/archivo/archivo.component';
import { DateUtility } from '../../../../utility/date-utility';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { NormativaService } from '../../../../services/normativa.service';
import { Archivo } from '../../../../models/archivo';
import { MultipleselectComponent } from '../../../../shared/components/multipleselect/multipleselect.component';
import { TipoNormativaService } from '../../../../services/tipo-normativa.service';
import { ChipItem } from '../../../../models/core/chips';
import { PerfilService } from '../../../../services/perfil.service';
import { NgClass } from '@angular/common';
import { ArchivoService } from '../../../../services/archivo.service';
import { ResponseServer } from '../../../../models/core/response-server';
import { ReporteService } from '../../../../services/reporte.service';
import { ModalVistaPreviaReporteComponent } from '../modal-vista-previa-reporte/modal-vista-previa-reporte.component';
import { MatDialog } from '@angular/material/dialog';
import { ResponseComponent } from '../../../../models/core/response-component';

@Component({
  selector: 'app-adm-reporte-reg',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,

    ArchivoComponent,
    MultipleselectComponent,
    NgClass
  ],
  templateUrl: './adm-reporte-reg.component.html',
  styleUrl: './adm-reporte-reg.component.scss'
})
export class AdmReporteRegComponent {
  _const = Constante;
  accionForm: string = this._const.ACCION_FORM_NEW;

  form = this.fb.group({
    //idPerfil: ['', Validators.required],
    cNombre: ['', Validators.required],
    cFechaInicioCtr: new FormControl<Date>(null as any, Validators.required),
    cFechaFinCtr: new FormControl<Date>(null as any, Validators.required),
    cObjetivo: ['', Validators.required],
  });

  idArchivo: number;
  reporteData: any = {};
  archivo: Archivo | null = null;
  invalidForm: boolean = true;
  disabledForm: boolean = false;

  readonly configCargosSelect = { label: 'Cargos', button: 'Agregar' };
  cargosSeledted = signal<any[]>([]);
  cargosRaw: ChipItem[] = [];

  readonly configAreasMSelect = { label: 'Gerencias', button: 'Agregar' };
  areasSeledted = signal<any[]>([]);
  areasRaw: ChipItem[] = [];

  readonly configPerfilesMSelect = { label: 'Perfiles', button: 'Agregar' };
  perfilesSeledted = signal<any[]>([]);
  perfilesRaw: ChipItem[] = [];

  readonly configCategoriasSelect = { label: 'Categorias', button: 'Agregar' };
  categoriasSeledted = signal<any[]>([]);
  categoriasRaw: ChipItem[] = [];

  readonly configOficinasSelect = { label: 'Oficinas', button: 'Agregar' };
  oficinasSeledted = signal<any[]>([]);
  oficinasRaw: ChipItem[] = [];

  idTiposNormativa: number[] = [];
  idOficinas: number[] = [];
  idPerfiles: number[] = [];
  idAreas: number[] = [];
  idCargos: number[] = [];

  lSelectCargo: boolean = false

  nCodigoArchivo = 1;

  listaGerenciasFull: any;

  lTodoGerencia: boolean = false;
  lTodoCategoria: boolean = false;
  lTodoOficina: boolean = false;
  lTodoCargo: boolean = false;
  lTodoPerfil: boolean = false;
  lCargaCompleta: boolean = false
  constructor(
    private fb: FormBuilder,
    private reportService: ReporteService,
    private tipoNormativaService: TipoNormativaService,
    private prerfilService: PerfilService,
    private appService: AppService,
    private destroyRef: DestroyRef,
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private archivoService: ArchivoService,
    public dialog: MatDialog,
  ) {
    this.idArchivo = -1;
    let _accionForm = this.activatedRoute.snapshot.data['accionForm'];

    this.accionForm = this._const.ACCION_FORM_NEW;
    if (_accionForm) {
      this.accionForm = _accionForm;

      this.disabledForm = (this.accionForm == this._const.ACCION_FORM_VIEW);
    }

    this.validarForm();
    //this.listarCargosNormativas();
    this.listarCategorias();
    this.listarAreas();
    this.listarOficinas();
    this.listarCargosNormativas(0)
    this.listarPerfilesNormativas();

    if (this.accionForm == this._const.ACCION_FORM_EDIT) {
      this.obtenerDatosCompartido();
    } else {
      this.reporteData.idNormativa = null;
      this.archivo = null;
      this.lCargaCompleta = true;
    }
  }


  //#region Metodos
  listarCargosNormativas(idArea: number) {

    this.appService.activateLoading();
    this.prerfilService.listCargos([-1])
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.appService.disableLoading();
          this.appService.disableLoading();
          ////console.log("Cargos", response);

          if (response.success == Constante.STATUS_OK) {
            let listado = response.data;

            this.cargosRaw = listado.map((item: any) => {
              return { id: item.idCargo, name: item.cCargo, check: false };
            });

          } else {
            this.toastr.warning(response.message, this._const.MESSAGE_TITLE_WARNING);
          }
        },
      });

  }

  listarCategorias() {
    let pagination = {
      nTotal: -1,
      pageIndex: -1,
      pageSize: -1,
    }
    this.appService.activateLoading();
    this.tipoNormativaService.listTipoNormativa(pagination)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.appService.disableLoading();
          ////console.log("tipos", response);

          if (response.success == Constante.STATUS_OK) {
            let listado = response.data.lstTNormativas;
            this.listaGerenciasFull = listado
            this.categoriasRaw = listado.map((item: any) => {
              return { id: item.id, name: item.cNombre, check: false };
            });

          } else {
            this.toastr.warning(response.message, this._const.MESSAGE_TITLE_WARNING);
          }
        },
      });
  }

  listarAreas() {
    this.appService.activateLoading();
    this.prerfilService.listAreas()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.appService.disableLoading();
          ////console.log("Areas", response);

          if (response.success == Constante.STATUS_OK) {
            let listado = response.data;
            this.listaGerenciasFull = listado
            this.areasRaw = listado.map((item: any) => {
              return { id: item.idGerencia, name: item.cGerencia, check: false };
            });

          } else {
            this.toastr.warning(response.message, this._const.MESSAGE_TITLE_WARNING);
          }
        },
      });
  }

  listarOficinas() {
    this.appService.activateLoading();
    this.prerfilService.listOficinas()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.appService.disableLoading();
          ////console.log("Oficinas", response);

          if (response.success == Constante.STATUS_OK) {
            let listado = response.data;
            this.listaGerenciasFull = listado
            this.oficinasRaw = listado.map((item: any) => {
              return { id: item.idOficina, name: item.cOficina, check: false };
            });

          } else {
            this.toastr.warning(response.message, this._const.MESSAGE_TITLE_WARNING);
          }
        },
      });
  }


  listarPerfilesNormativas() {
    let pagination = {
      nTotal: -1,
      pageIndex: -1,
      pageSize: -1,
    }
    this.appService.activateLoading();
    this.prerfilService.listPerfiles(pagination)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.appService.disableLoading();

          if (response.success == Constante.STATUS_OK) {
            let listado = response.data.lstPerfiles;

            this.perfilesRaw = listado.map((item: any) => {
              return { id: item.idPerfil, name: item.cNombre, check: false };
            });

          } else {
            this.toastr.warning(response.message, this._const.MESSAGE_TITLE_WARNING);
          }
        },
      });
  }

  nuevoRegistro(reporte: any) {
    ////console.log("normativa: ", normativa);

    this.appService.activateLoading();
    this.reportService.saveReporte(reporte)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.appService.disableLoading();

          if (response.success == this._const.STATUS_OK) {
            this.toastr.success(response.message, this._const.MESSAGE_TITLE_SUCCESS);
            this.disableForm();
            this.accionForm = this._const.ACCION_FORM_VIEW;

          } else {
            console.error(this._const.MESSAGE_ERROR_SERVER, response.errors);
            this.toastr.warning(response.message, this._const.MESSAGE_TITLE_WARNING);
          }
        },
        error: (err: any) => {
          this.appService.disableLoading();
          console.error(this._const.MESSAGE_ERROR_SERVER, err);
          this.toastr.error(this._const.MESSAGE_ERROR_SERVER, this._const.MESSAGE_TITLE_ERROR);
        }
      });
  }

  actualizarRegistro(reporte: any) {
    ////console.log("normativa: ", normativa);

    this.appService.activateLoading();
    this.reportService.updateReporte(reporte)
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          this.appService.disableLoading();

          if (response.success == this._const.STATUS_OK) {
            this.toastr.success(response.message, this._const.MESSAGE_TITLE_SUCCESS);
            this.disableForm();
            this.accionForm = this._const.ACCION_FORM_VIEW;

          } else {
            console.error(this._const.MESSAGE_ERROR_SERVER, response.errors);
            this.toastr.warning(response.message, this._const.MESSAGE_TITLE_WARNING);
          }
        },
        error: (err: any) => {
          this.appService.disableLoading();
          console.error(this._const.MESSAGE_ERROR_SERVER, err);
          this.toastr.error(this._const.MESSAGE_ERROR_SERVER, this._const.MESSAGE_TITLE_ERROR);
        }
      });
  }

  disableForm() {
    this.disabledForm = true;
    this.form.controls.cNombre.disable();
    this.form.controls.cFechaInicioCtr.disable();
    this.form.controls.cFechaFinCtr.disable();
    this.form.controls.cObjetivo.disable();
  }

  validarForm() {
    ////console.log("this.invalidForm", this.invalidForm);
    ////console.log(this.idArchivo)

    if (this.idTiposNormativa.length <= 0) { this.invalidForm = true; return; }
    if (this.idOficinas.length <= 0) { this.invalidForm = true; return; }
    if (this.idAreas.length <= 0) { this.invalidForm = true; return; }

    this.invalidForm = false;
    ////console.log("actualizad this.isValidForm", this.invalidForm);

  }
  //#endregion

  //#region
  onSelectedTNormativa($event: any) {
    ////console.log("onSelectedTNormativa", $event);
    let _response = $event;

    if (_response.status == Constante.STATUS_OK) {
      let _listado = _response.data;

      this.idTiposNormativa = _listado.map((item: any) => item.id);
      ////console.log("this.idTiposNormativa", this.idTiposNormativa);
    }

    this.validarForm();
  }
  onSelectedOficinas($event: any) {
    ////console.log("onSelectedTNormativa", $event);
    let _response = $event;

    if (_response.status == Constante.STATUS_OK) {
      let _listado = _response.data;

      this.idOficinas = _listado.map((item: any) => item.id);
      ////console.log("this.idTiposNormativa", this.idTiposNormativa);
    }

    this.validarForm();
  }

  onSelectedAreas($event: any) {
    let _response = $event;
    // this.cargosRaw = []
    // this.cargosSeledted.set([])

    if (_response.status == Constante.STATUS_OK) {
      let _listado = _response.data;

      this.idAreas = _listado.map((item: any) => item.id);
      ////console.log('geren', _listado)
    }
    // this.lSelectCargo = this.idAreas.length == 1 && this.idAreas[0] != -1 ? true : false;
    // if (this.lSelectCargo)
    //   this.listarCargosNormativas(this.idAreas[0])

    // if (this.idAreas[0] == -1 && this.idAreas.length == 1) {
    //   this.lTodoCargo = true
    //   this.cargosSeledted.update(item => [...item, { id: -1, name: 'TODO', check: true }]);
    //   //this.cargosSeledted.update(item => [...item, { id: -1, name: 'TODO', check: true }]);
    // } else if (this.idAreas.length >= 1) {
    //   this.lTodoCargo = true
    //   this.cargosSeledted.update(item => [...item, { id: -1, name: 'TODO', check: true }]);
    // }
    // else {
    //   this.lTodoCargo = false
    // }
    this.validarForm();
  }

  onSelectedCargos($event: any) {
    ////console.log("onSelectedCargos", $event);
    let _response = $event;

    if (_response.status == Constante.STATUS_OK) {
      let _listado = _response.data;

      this.idCargos = _listado.map((item: any) => item.id);
      ////console.log("this.idCargos", this.idCargos);
    }

    this.validarForm();
  }

  onSelectedPerfiles($event: any) {
    let _response = $event;

    if (_response.status == Constante.STATUS_OK) {
      let _listado = _response.data;

      this.idPerfiles = _listado.map((item: any) => item.id);
    }

    this.validarForm();
  }

  onGuardarReporte() {

    let _nombre = this.form.get('cNombre')?.value;
    let _fechaIniCtr = this.form.get('cFechaInicioCtr')?.value;
    let _fechaFinCtr = this.form.get('cFechaFinCtr')?.value;
    let _objetivo = this.form.get('cObjetivo')?.value;
    let _fechaIni = DateUtility.dateToString(_fechaIniCtr!, 'YYYY-MM-DD');
    let _fechaFin = DateUtility.dateToString(_fechaFinCtr!, 'YYYY-MM-DD');

    let _reporte = {
      idReporte: null,
      cNombre: _nombre,
      cDescripcion: _objetivo,
      cCategoria: this.idTiposNormativa.length == 1 && this.idTiposNormativa[0] == -1 ? '%' : this.idTiposNormativa.join(","),
      cOficina: this.idOficinas.length == 1 && this.idOficinas[0] == -1 ? '%' : this.idOficinas.join(","),
      cGerencia: this.idAreas.length == 1 && this.idAreas[0] == -1 ? '%' : this.idAreas.join(","),
      cCargo: this.idCargos.length == 1 && this.idCargos[0] == -1 ? '%' : this.idCargos.join(","),
      cFechaInicio: _fechaIni,
      cFechaFin: _fechaFin
    };

    //console.log('reporteSend', _reporte)
    if (this.accionForm == this._const.ACCION_FORM_NEW) {
      this.nuevoRegistro(_reporte);
    } else if (this.accionForm == this._const.ACCION_FORM_EDIT) {
      _reporte.idReporte = this.reporteData.objReporte.idReporte;
      this.actualizarRegistro(_reporte);
    }
  }

  onAbrirVistaPrevia() {
    let _nombre = this.form.get('cNombre')?.value;
    let _fechaIniCtr = this.form.get('cFechaInicioCtr')?.value;
    let _fechaFinCtr = this.form.get('cFechaFinCtr')?.value;
    let _objetivo = this.form.get('cObjetivo')?.value;
    let _fechaIni = DateUtility.dateToString(_fechaIniCtr!, 'YYYY-MM-DD');
    let _fechaFin = DateUtility.dateToString(_fechaFinCtr!, 'YYYY-MM-DD');

    let _reporte = {
      idReporte: null,
      cNombre: _nombre,
      cDescripcion: _objetivo,
      cCategoria: this.idTiposNormativa.length == 1 && this.idTiposNormativa[0] == -1 ? '%' : this.idTiposNormativa.join(","),
      cOficina: this.idOficinas.length == 1 && this.idOficinas[0] == -1 ? '%' : this.idOficinas.join(","),
      cGerencia: this.idAreas.length == 1 && this.idAreas[0] == -1 ? '%' : this.idAreas.join(","),
      cCargo: this.idCargos.length == 1 && this.idCargos[0] == -1 ? '%' : this.idCargos.join(","),
      cFechaInicio: _fechaIni,
      cFechaFin: _fechaFin
    };

    //console.log('reporteSend', _reporte)
    this.dialog.open(ModalVistaPreviaReporteComponent, {
      maxWidth: '2000px',
      width: '1400px',
      data: { data: _reporte },
    }).afterClosed().subscribe((response: ResponseComponent<any>) => {
      if (response.status == this._const.DIALOG_STATUS_OK) {
        this.onGuardarReporte()
      }
    });
  }
  obtenerDatosCompartido() {
    this.appService.getValueSharedData()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((reporte: any) => {

        if (reporte == null) {
          this.router.navigate([this._const.URL_ADM_REPORTE_LIST]);
          return
        }

        ////console.log("normativa edit", normativa);


        this.reportService.getReporte(reporte)
          .pipe(take(1), takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (response: any) => {
              this.appService.disableLoading();
              //console.log("reporte rcovery", response);

              if (response.success == Constante.STATUS_OK) {
                this.reporteData = response.data;

                let _fechaInicioCtr: Date = DateUtility.stringToDate(this.reporteData.objReporte.cFechaInicio, 'YYYY-MM-DD');
                let _fechaFinCtr: Date = DateUtility.stringToDate(this.reporteData.objReporte.cFechaFin, 'YYYY-MM-DD');

                this.form.controls.cNombre.setValue(this.reporteData.objReporte.cNombre);
                this.form.controls.cFechaInicioCtr.setValue(_fechaInicioCtr);
                this.form.controls.cFechaFinCtr.setValue(_fechaFinCtr);
                this.form.controls.cObjetivo.setValue(this.reporteData.objReporte.cDescripcion);

                this.lTodoGerencia = this.reporteData.objReporte.cGerencia == "%" ? true : false

                this.lTodoOficina = this.reporteData.objReporte.cOficina == "%" ? true : false
                this.lTodoCargo = this.reporteData.objReporte.cCargo == "%" ? true : false
                //this.lTodoPerfil = reporte.cGerencia == "%" ? true : false
                this.lTodoCategoria = this.reporteData.objReporte.cCategoria == "%" ? true : false

                if (!this.lTodoOficina) {
                  this.reporteData.lstOficina.forEach((x: any) => {
                    this.oficinasSeledted.update(item => [...item, { id: x.idOficina, name: x.cOficina, check: true }]);
                    this.idOficinas = this.reporteData.lstOficina.map((item: any) => item.idOficina);
                  });
                }

                if (!this.lTodoGerencia) {
                  this.reporteData.lstGerencia.forEach((x: any) => {
                    this.areasSeledted.update(item => [...item, { id: x.idGerencia, name: x.cGerencia, check: true }]);
                    this.idAreas = this.reporteData.lstGerencia.map((item: any) => item.idGerencia);
                  });
                  if (this.idAreas.length == 1) {
                    this.listarCargosNormativas(this.idAreas[0])
                    this.lSelectCargo = true
                  }

                }

                if (!this.lTodoCategoria) {
                  this.reporteData.lstTipo.forEach((x: any) => {
                    this.categoriasSeledted.update(item => [...item, { id: x.idTipo, name: x.cTipo, check: true }]);
                    this.idTiposNormativa = this.reporteData.lstTipo.map((item: any) => item.idTipo);
                  });

                }

                if (!this.lTodoCargo) {
                  this.reporteData.lstCargos.forEach((x: any) => {
                    this.cargosSeledted.update(item => [...item, { id: x.idCargo, name: x.cCargo, check: true }]);
                    this.idCargos = this.reporteData.lstCargos.map((item: any) => item.idCargo);
                  });
                }

                this.invalidForm = false;

                this.lCargaCompleta = true

              } else {
                this.toastr.warning(response.message, this._const.MESSAGE_TITLE_WARNING);
              }
            },
          });
      });
  }

  onSalirForm() {
    this.router.navigate([this._const.URL_ADM_REPORTE_LIST]);
  }
  //endregion

}
