import { Routes } from '@angular/router';
import { ConstructorComponent } from './components/constructor/constructor.component';

export const routes: Routes = [
    { path: '', redirectTo: 'workwear', pathMatch: 'full' },
    { path: 'workwear', component: ConstructorComponent },
    { path: 'shoes', component: ConstructorComponent },
    { path: 'gloves', component: ConstructorComponent },
    { path: 'individual_protection', component: ConstructorComponent },
    { path: 'others', component: ConstructorComponent },
    { path: '**', redirectTo: 'workwear' }
];