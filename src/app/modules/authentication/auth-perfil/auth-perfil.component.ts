import { HttpClientModule } from '@angular/common/http';
import { Component, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { take } from 'rxjs';
import { UsuarioAS } from '../../../models/usuarioas';
import { AppService } from '../../../services/core/app.service';
import { SecurityService } from '../../../services/core/security.service';
import { AuthUtility } from '../../../utility/auth-utility';
import { Constante } from '../../../utility/constante';
import { AppUtility } from '../../../utility/app-utility';
import { NormativaService } from '../../../services/normativa.service';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-auth-perfil',
    standalone: true,
    imports: [RouterOutlet, RouterLink, MatButtonModule, MatIconModule, HttpClientModule,
        //user
        MatMenuModule, MatDividerModule,
        MatCardModule, MatFormFieldModule,
        MatFormFieldModule, MatInputModule, MatSelectModule,
        MatCardModule,

        MatSidenavModule,
        MatToolbarModule,
        MatTooltipModule,
        FooterComponent,
        CommonModule
    ],
    templateUrl: './auth-perfil.component.html',
    styleUrl: './auth-perfil.component.scss'
})
export class AuthPerfilComponent {
    _const = Constante;
    currentYear: string = new Date().getFullYear().toString();

    listaPerfiles: any[] = [];

    //idPerfil: number = 0;
    //perfilNombre: number = 0;
    isSelectedPerfil: boolean = false;
    user: UsuarioAS | null = null;
    perfil: any = {};
    nombrePerfil: string | null = null;

    lAcceso: boolean = false
    lPerfiles: boolean = false

    mensajeError: string = ''

    public constructor(
        private appService: AppService,
        private securityService: SecurityService,
        private normativaService: NormativaService,
        private destroyRef: DestroyRef,
        private toastr: ToastrService,
        private router: Router,
        private activatedRoute: ActivatedRoute,
    ) {
        let _isChangePerfil = this.activatedRoute.snapshot.data['isChangePerfil'];
        ////console.log("isChangePerfil", _isChangePerfil);

        if (_isChangePerfil) {
            this.user = AuthUtility.getValueUserAS();
            this.perfil = AuthUtility.getPerfil();
            this.nombrePerfil = this.perfil.cPefil;

            let _tokenabc: any = AuthUtility.getTokenIdentity();
            AuthUtility.initSessionData(_tokenabc);

            this.lAcceso = true;
            this.getPerfiles();
        } else {
            this.nombrePerfil = null;
            this.obtenerDatosCompartido();
        }
    }

    //#region Metodos
    obtenerDatosCompartido() {
        this.appService.getValueSharedData()
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe((tokenIdentity: any) => {

                if (tokenIdentity == null) {
                    this.appService.goAndesSuite();
                    return
                }

                AuthUtility.setTokenIdentity(tokenIdentity);
                AuthUtility.initSessionData(tokenIdentity);
                this.getInfoUsuario();
                this.getPerfiles();
            });
    }

    getInfoUsuario() {
        this.appService.activateLoading();
        this.securityService.getInfoUser()
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: any) => {
                    ////console.log("response user", response);

                    this.appService.disableLoading();
                    if (response.success == Constante.STATUS_OK) {
                        this.lAcceso = true
                        let _user = new UsuarioAS();
                        _user.idUsuario = response.data.idUsuario;
                        _user.cNombreUsuario = response.data.cNombreUsuario;
                        _user.cNombreCompleto = response.data.cNombreCompleto;
                        _user.cNombreCorto = this.getFirstTwoWords(_user.cNombreCompleto);

                        AuthUtility.setValueUserAS(_user);
                        this.user = AuthUtility.getValueUserAS();
                        
                    }
                    else {
                        this.lAcceso = false
                        this.toastr.warning(response.errors[0].message, this._const.MESSAGE_TITLE_WARNING);
                        setTimeout(() => { this.appService.goAndesSuite(); }, 20000)
                    }
                }
            });
    }

    getPerfiles() {
        ////console.log("Perfiles AuthUtility.getToken()", AuthUtility.getToken());
        this.appService.activateLoading();
        this.securityService.getPerfiles()
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: any) => {
                    this.appService.disableLoading();
                    if (response.success == Constante.STATUS_OK) {
                        this.lPerfiles = true
                        this.listaPerfiles = response.data;
                    } else {
                        this.mensajeError = response.errors[0].message
                        this.lPerfiles = false
                    }
                }
            });
    }

    getFirstTwoWords(str: string) {
        const words = str.split(" ");

        if (words.length >= 2) {
            let _nameUser = words[0].replace(/\s/g, "");
            let _apeUser = words[1].replace(/\s/g, "");

            /*_nameUser = _nameUser.toLowerCase();
            _apeUser = _apeUser.toLowerCase();


            _nameUser = _nameUser.replace(/^./, function (match) {
                return match.toUpperCase();
            });

            _apeUser = _apeUser.replace(/^./, function (match) {
                return match.toUpperCase();
            })*/

            return _nameUser + ' ' + _apeUser;
        } else {
            return str;
        }
    }
    //#endregion

    //#region Eventos
    onIngresarApp() {
        /*this.router.navigate([Constante.URL_DASHBOARD]);
        AuthUtility.setPerfil(this.perfil);*/

        this.appService.activateLoading();
        this.normativaService.logIngresoApp()
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: any) => {
                    this.appService.disableLoading();

                    AuthUtility.setPerfil(this.perfil);
                    this.router.navigate([Constante.URL_DASHBOARD]);
                }
            });
    }

    onPerfilSeleccionado($event: any) {
        let _idAgencia: number = 0;
        let _idPerfil: number = $event.value;

        let data = {
            idAgencia: _idAgencia,
            idPerfil: _idPerfil
        }

        this.getTokenApp(data);

        const selectedPerfil = this.listaPerfiles.find((perfil: any) => perfil.idPerfil === _idPerfil);

        if (selectedPerfil) {
            this.perfil = selectedPerfil;
        }
    }

    getTokenApp(data: any) {
        this.appService.activateLoading();
        this.securityService.getTokenApp(data)
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response: any) => {

                    ////console.log("response perfil", response);
                    if (response.success == Constante.STATUS_OK) {

                        // se inicia sesion con este nuevo token
                        AuthUtility.initSessionData(response.data);
                        this.isSelectedPerfil = true;

                        this.securityService.getMenus()
                            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
                            .subscribe({
                                next: (response: any) => {
                                    this.appService.disableLoading();

                                    if (response.success == Constante.STATUS_OK) {
                                        const _menuMain = AppUtility.construirMenu(response.data);
                                        AuthUtility.setMenu(_menuMain);
                                    }
                                }
                            });


                    }
                },
                error: (err: any) => {
                    this.appService.disableLoading();
                    console.error(this._const.MESSAGE_ERROR_SERVER, err);
                    this.toastr.error(this._const.MESSAGE_ERROR_SERVER, this._const.MESSAGE_TITLE_ERROR);
                }
            });
    }

    onSignOut() {
        this.appService.goSignOut();
    }

    onIrAndesSuite() {
        this.appService.goAndesSuite();
    }
    //#endregion

}
