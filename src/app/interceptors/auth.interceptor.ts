import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const authReq = addToken(req, authService.accessToken());

    return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401 && !req.url.includes('/auth/')) {
                return authService.refresh().pipe(
                    switchMap(res => next(addToken(req, res.accessToken))),
                    catchError(() => {
                        authService.clearAuth();
                        router.navigate(['/login']);
                        return throwError(() => error);
                    })
                );
            }
            return throwError(() => error);
        })
    );
};

function addToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
    if (!token) return req;
    return req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
        withCredentials: true
    });
}
