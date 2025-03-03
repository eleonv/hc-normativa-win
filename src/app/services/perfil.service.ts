import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Pagination } from '../models/core/pagination';
import { AppUtility } from '../utility/app-utility';

@Injectable({
    providedIn: 'root'
})
export class PerfilService {

    url: string = AppUtility.addTrailingSlash(environment.API_URL_BASE);

    constructor(private http: HttpClient) { }

    savePerfil(perfil: any): Observable<any> {
        return this.http.post<any>(this.url + "registrar-perfil", perfil);
    }

    updatePerfil(perfil: any): Observable<any> {
        return this.http.put<any>(this.url + "actualizar-perfil", perfil);
    }

    deletePerfil(perfil: any): Observable<any> {
        return this.http.delete<any>(this.url + "eliminar-perfil?idPerfil=" + perfil.idPerfil);
    }

    listPerfiles(pagination: Pagination): Observable<any> {
        return this.http.get<any>(this.url + "lista-perfiles?nPageIndex=" + pagination.pageIndex + " &nPageSize=" +  + pagination.pageSize);
    }

    // gerencias
    listAreas(): Observable<any> {
        return this.http.get<any>(this.url + "lista-gerencias");
    }

    // cargos
    listCargos(lstCargos: number[]): Observable<any> {
        let params = new HttpParams();
        if (lstCargos[0] != -1) {
            for (let i = 0; i < lstCargos.length; i++) {
                params = params.append('lstAreas', lstCargos[i]);
            }
        }
        return this.http.get<any>(this.url + "lista-cargos", { params });
    }

    // oficinas
    listOficinas(): Observable<any> {
        return this.http.get<any>(this.url + "lista-oficinas");
    }

}
