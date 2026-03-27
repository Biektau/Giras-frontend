import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthLayoutComponent } from '../auth-layout/auth-layout.component';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    imports: [ReactiveFormsModule, AuthLayoutComponent]
})
export class LoginComponent {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly toast = inject(ToastService);

    isLoading = signal(false);
    serverError = signal('');

    loginForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', Validators.required]
    });

    onSubmit() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }
        this.isLoading.set(true);
        this.serverError.set('');

        this.authService.login(this.loginForm.value as any).pipe(
            switchMap(() => this.authService.getMe())
        ).subscribe({
            next: (user) => {
                if (user.role !== 'admin') {
                    this.authService.logout().subscribe();
                    this.serverError.set('Доступ разрешён только администраторам');
                    this.isLoading.set(false);
                    return;
                }
                this.router.navigate(['/']);
            },
            error: (err) => {
                const message = err.error?.message ?? 'Ошибка входа';
                this.serverError.set(message);
                this.toast.error(message);
                this.isLoading.set(false);
            }
        });
    }

    getError(field: string): string {
        const control = this.loginForm.get(field);
        if (!control?.errors || !control.touched) return '';
        if (control.errors['required']) return 'Поле обязательно';
        if (control.errors['email']) return 'Некорректный email';
        return '';
    }
}