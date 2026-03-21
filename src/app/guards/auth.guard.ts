import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, of, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        if (authService.currentUser()?.role !== 'admin') {
            router.navigate(['/login']);
            return false;
        }
        return true;
    }

    return authService.refresh().pipe(
        switchMap(() => authService.getMe()),
        map(user => {
            if (user.role !== 'admin') {
                router.navigate(['/login']);
                return false;
            }
            return true;
        }),
        catchError(() => {
            router.navigate(['/login']);
            return of(false);
        })
    );
};