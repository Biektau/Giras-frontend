import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { Router } from '@angular/router';
import { tap } from "rxjs";
import { AuthUser } from "../interfaces/user.interface";

@Injectable({providedIn: 'root'})
export class AuthService {
     private readonly http = inject(HttpClient);
    private readonly router = inject(Router);

    private readonly apiUrl = 'http://localhost:3000/api/auth';

    accessToken = signal<string | null>(null);
    currentUser = signal<AuthUser | null>(null);

    login(dto: { email: string; password: string }) {
        return this.http.post<{ accessToken: string }>(`${this.apiUrl}/login`, dto, { withCredentials: true }).pipe(
            tap(res => this.accessToken.set(res.accessToken))
        );
    }

    refresh() {       
        return this.http.post<{ accessToken: string }>(`${this.apiUrl}/refresh`, {}, { withCredentials: true }).pipe(
            tap(res => this.accessToken.set(res.accessToken))
        );
    }

     logout() {
        return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
            tap(() => {
                this.accessToken.set(null);
                this.currentUser.set(null);
                this.router.navigate(['/login']);
            })
        );
    }

    getMe() {
        return this.http.get<AuthUser>(`${this.apiUrl}/me`).pipe(
            tap(user => this.currentUser.set(user))
        );
    }

     isAuthenticated(): boolean {
        return !!this.accessToken();
    }
}