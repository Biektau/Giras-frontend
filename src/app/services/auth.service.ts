import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { Router } from '@angular/router';
import { Observable, shareReplay, tap, finalize } from "rxjs";
import { AuthUser } from "../interfaces/user.interface";

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    private readonly apiUrl = 'http://localhost:3000/api/auth';

    private readonly tokenSignal = signal<string | null>(null);
    private readonly userSignal = signal<AuthUser | null>(null);

    readonly accessToken = this.tokenSignal.asReadonly();
    readonly currentUser = this.userSignal.asReadonly();

    private refreshInProgress$: Observable<{ accessToken: string }> | null = null;

    login(dto: { email: string; password: string }) {
        return this.http.post<{ accessToken: string }>(`${this.apiUrl}/login`, dto, { withCredentials: true }).pipe(
            tap(res => this.tokenSignal.set(res.accessToken))
        );
    }

    refresh(): Observable<{ accessToken: string }> {
        if (!this.refreshInProgress$) {
            this.refreshInProgress$ = this.http
                .post<{ accessToken: string }>(`${this.apiUrl}/refresh`, {}, { withCredentials: true })
                .pipe(
                    tap(res => this.tokenSignal.set(res.accessToken)),
                    finalize(() => this.refreshInProgress$ = null),
                    shareReplay(1)
                );
        }
        return this.refreshInProgress$;
    }

    logout() {
        return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
            tap(() => {
                this.clearAuth();
                this.router.navigate(['/login']);
            })
        );
    }

    getMe() {
        return this.http.get<AuthUser>(`${this.apiUrl}/me`).pipe(
            tap(user => this.userSignal.set(user))
        );
    }

    isAuthenticated(): boolean {
        return !!this.accessToken();
    }

    clearAuth(): void {
        this.tokenSignal.set(null);
        this.userSignal.set(null);
    }
}
