import { Component, Input } from "@angular/core";
import { NgStyle } from "@angular/common";

@Component({
    selector: 'app-items-list',
    templateUrl: './items-list.component.html',
    styleUrl: './items-list.component.scss',
    imports: [NgStyle]
})
export class ItemsListComponent {
    @Input('width') width = 600;
}
