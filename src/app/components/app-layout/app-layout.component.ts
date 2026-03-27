import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';
import { ToastComponent } from '../toast/toast.component';

@Component({
    selector: 'app-layout',
    templateUrl: './app-layout.component.html',
    styleUrl: './app-layout.component.scss',
    imports: [RouterOutlet, HeaderComponent, ToastComponent]
})
export class AppLayoutComponent {}