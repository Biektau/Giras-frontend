import { Component, inject } from '@angular/core';
import { Category } from '../../interfaces/categories.interface';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LogOut, LucideAngularModule } from "lucide-angular/src/icons";


@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    imports: [RouterLink, RouterLinkActive, LucideAngularModule]
})
export class HeaderComponent {
    private readonly authService = inject(AuthService);

    readonly currentUser = this.authService.currentUser;

    readonly LogOut = LogOut;

    categories: Category[] = [
        { label: 'Спецодежда', url: '/workwear' },
        { label: 'Обувь', url: '/shoes' },
        { label: 'Перчатки', url: '/gloves' },
        { label: 'СИЗ', url: '/individual_protection' },
        { label: 'Разное', url: '/others' }
    ];

    logout() {
        this.authService.logout().subscribe();
    }
}