import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthUtility } from '../../utility/auth-utility';
import { environment } from '../../../environments/environment';
import { Constante } from '../../utility/constante';
import { Router } from '@angular/router';


@Injectable({
    providedIn: 'root'
})
export class AppService {
    loading$ = new BehaviorSubject<boolean>(false);
    sharedData$ = new BehaviorSubject<any>(null);

    version: string = environment.VERSION;

    constructor(private router: Router) { }

    // loading
    getValueLoading() {
        return this.loading$.asObservable();
    }

    activateLoading() {
        this.loading$.next(true);
    }

    disableLoading() {
        this.loading$.next(false);
    }

    // shared data
    getValueSharedData(): Observable<any> {
        return this.sharedData$.asObservable();
    }

    setValueSharedData(data: any) {
        return this.sharedData$.next(data);
    }

    // methods
    goSignOut() {
        AuthUtility.closeSessionData();
        //let urlIdentity = environment.URL_IDENTITY;
        //window.open(urlIdentity + Constante.URL_IDENTITY_SIGN_OUT, '_self');
        this.router.navigate(['/login']);
    }

    goAndesSuite() {
        AuthUtility.clearPerfil();
        //let urlIdentity = environment.URL_IDENTITY;
        //window.open(urlIdentity + Constante.URL_IDENTITY_DASHBOARD_HOME, '_self');
        this.goSignOut();
    }

    goAndesSuiteLogin() {
        //let urlIdentity = environment.URL_IDENTITY;
        //window.open(urlIdentity + Constante.URL_IDENTITY_LOGIN, '_self');
        this.goSignOut();
    }

    getVersion() {
        return this.version;
    }

}
