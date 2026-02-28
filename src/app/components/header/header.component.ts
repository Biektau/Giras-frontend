import { Component } from '@angular/core';
import { Category } from '../../interfaces/categories.interface';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports:[RouterLink, RouterLinkActive]
})
export class HeaderComponent {
  categories: Category[] = [
        { label: 'Спецодежда', url: '/workwear' },
        { label: 'Обувь', url: '/shoes' },
        { label: 'Перчатки', url: '/gloves' },
        { label: 'СИЗ', url: '/individual_protection' },
        { label: 'Разное', url: '/others' }
    ];
}
