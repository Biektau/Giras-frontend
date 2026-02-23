import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { ConstructorComponent } from './pages/constructor/constructor.component';

@Component({
  selector: 'app-root',
  imports: [HeaderComponent, ConstructorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
}
