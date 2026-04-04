import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';
import { ConstructorComponent } from './components/constructor/constructor.component';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
    { path: 'login', component: LoginComponent },
    {
        path: '',
        component: AppLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'workwear', pathMatch: 'full' },
            { path: 'workwear', component: ConstructorComponent },
            { path: 'shoes', component: ConstructorComponent },
            { path: 'gloves', component: ConstructorComponent },
            { path: 'individual_protection', component: ConstructorComponent },
            { path: 'others', component: ConstructorComponent },
        ]
    },
    { path: '**', redirectTo: 'workwear' }
];