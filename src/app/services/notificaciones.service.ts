import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pagination } from '../models/core/pagination';
import { AppUtility } from '../utility/app-utility';
import { AuthUtility } from '../utility/auth-utility';

@Injectable({
    providedIn: 'root'
})
export class NotificacionesService {

    url: string = AppUtility.addTrailingSlash(environment.API_URL_BASE);

    constructor(private http: HttpClient) { }

    getNumNotificaciones(): Observable<any> {
        return this.http.get<any>(this.url + "notificaciones?nTipoPadre=" + 0);
    }

    getNotificaciones(idPadre: number): Observable<any> {
        return this.http.get<any>(this.url + "notificaciones?nTipoPadre=" + idPadre);
    }
}
