import { HttpClientModule } from '@angular/common/http';
import { Component, DestroyRef, Input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Menu } from '../../models/menu';
import { Constante } from '../../utility/constante';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { UsuarioAS } from '../../models/usuarioas';
import { AppService } from '../../services/core/app.service';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { NotificacionesService } from '../../services/notificaciones.service';
import { take } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatListModule } from '@angular/material/list';
@Component({
    selector: 'app-classic-layout',
    standalone: true,
    imports: [RouterOutlet, RouterLink, MatButtonModule, MatIconModule, HttpClientModule,
        //user
        MatMenuModule, MatDividerModule,
        MatCardModule, MatFormFieldModule,
        MatFormFieldModule, MatInputModule, MatSelectModule,
        FooterComponent,
        MatTooltipModule,
        MatBadgeModule,
        MatListModule
    ],
    templateUrl: './classic-layout.component.html',
    styleUrl: './classic-layout.component.scss'
})
export class ClassicLayoutComponent {
    _const = Constante;
    showNavigation: boolean = true;

    @Input() menu: Menu[] = [];
    @Input() user: UsuarioAS | null = null;
    @Input() nombrePerfil: string | null = null;

    nNotiNormativas = 0
    nNotiGuias = 0
    nNotiProyectos = 0

    dataNotificaciones: any = []
    constructor(
        private router: Router,
        public dialog: MatDialog,
        private appService: AppService,
        private notiService: NotificacionesService,
        private destroyRef: DestroyRef
    ) { }

    ngOnInit() {
        this.cargarNumNotificaciones();
    }
    cargarNumNotificaciones() {
        this.appService.activateLoading();
        this.notiService.getNumNotificaciones()
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: any) => {
                    this.appService.disableLoading();

                    if (response.success == Constante.STATUS_OK) {
                        this.nNotiNormativas = response.data.nCantidadProcesos
                        this.nNotiGuias = response.data.nCantidadGuias
                        this.nNotiProyectos = response.data.nCantidadProyectos
                    } else {
                    }
                },
                error: (err: any) => {
                    this.appService.disableLoading();
                }
            });
    }
    cargarNotificaciones(idPadre: number) {
        this.appService.activateLoading();
        this.notiService.getNotificaciones(idPadre)
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: any) => {
                    this.appService.disableLoading();

                    if (response.success == Constante.STATUS_OK) {
                        this.dataNotificaciones = response.data
                    } else {
                    }
                },
                error: (err: any) => {
                    this.appService.disableLoading();
                }
            });
    }
    openNormativa(normativa: any, tipo:number) {
        let _rutaOrigen = "";
        switch (tipo) {
            case this._const.TIPO_NOR_NORMATIVA: _rutaOrigen = Constante.URL_USER_NORMATIVAS; break;
            case this._const.TIPO_NOR_GUIA: _rutaOrigen = Constante.URL_USER_GUIAS; break;
            case this._const.TIPO_NOR_PROYECTO: _rutaOrigen = Constante.URL_USER_PROYECTOS; break;
            default: _rutaOrigen = Constante.URL_USER_NORMATIVAS; break;
        }

        let _data = {
            rutaOrigen: _rutaOrigen,
            normativa: normativa
        }
        this.appService.setValueSharedData(_data);
        this.router.navigateByUrl('/temp', { skipLocationChange: true }).then(() => {
            this.router.navigate([this._const.URL_PDF_VIEW]);
        });
        
        
    }
    onToggleNavigation(name: string) {
        this.showNavigation = this.showNavigation ? false : true;
    }

    onSignOut() {
        this.appService.goSignOut();
    }

    onIrAndesSuite() {
        this.appService.goAndesSuite();
    }

    onCambiarPerfil() {
        this.router.navigate([Constante.URL_PERFIL_CAMBIAR]);
    }

    onActiveMenu(item: Menu) {
        this.desactiveAllMenu(this.menu);

        item.active = item.active ? false : true;
        ////console.log('active menu', item.name);
    }

    onExpandedMenu(item: Menu) {
        item.expanded = item.expanded ? false : true;
        ////console.log('expanded menu', item.name);
    }

    onBusquedaAvanzada() {
        this.router.navigate([Constante.URL_BUSQUEDA_AVANZADA]);
    }

    desactiveAllMenu(items: Menu[]) {

        items.forEach((x) => {
            x.active = false;

            if (x.submenu) {
                this.desactiveAllMenu(x.submenu);
            }
        });
    }

}
