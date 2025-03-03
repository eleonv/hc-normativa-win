
import { HttpInterceptorFn } from '@angular/common/http';
import { AuthUtility } from '../../utility/auth-utility';
import { inject } from '@angular/core';
import { AppService } from '../../services/core/app.service';
import { catchError, finalize, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Constante } from '../../utility/constante';

export const appInterceptor: HttpInterceptorFn = (request, next) => {

    // custom request
    var customRequest = request.clone();

    if (AuthUtility.isAuthenticated()) {
        customRequest = request.clone({
            headers: request.headers.set('Authorization', 'Bearer ' + AuthUtility.getToken())
        });
    }

    // error control
    const appService = inject(AppService);
    const toastr = inject(ToastrService);
    const _const = Constante;

    //return next(customRequest);

    //appService.activateLoading();
    return next(customRequest).pipe(
        finalize(() =>{
            //appService.deactivateLoading();
        }),
        catchError((error) => {
            console.error(_const.MESSAGE_ERROR_SERVER, error);
            toastr.error(_const.MESSAGE_ERROR_SERVER, _const.MESSAGE_TITLE_ERROR);

            if (error.status == 401) {
                toastr.error("Su sesión ha cadudado", _const.MESSAGE_TITLE_INFO);
                appService.goAndesSuiteLogin();
            }

            return throwError(() => new Error(error));
        })
    );
};
