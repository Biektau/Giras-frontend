import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
    selector: 'app-layout',
    templateUrl: './app-layout.component.html',
    styleUrl: './app-layout.component.scss',
    imports: [RouterOutlet, HeaderComponent]
})
export class AppLayoutComponent {}