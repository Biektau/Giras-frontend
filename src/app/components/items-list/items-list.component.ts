import { Component, Input } from "@angular/core";
import { NgStyle } from "@angular/common";
import { FilterListComponent } from "../filter-list/filter-list.component";
import { SearchListComponent } from "../search-list/search-list.component";
import { ListComponent } from "../list/list.component";

@Component({
    selector: 'app-items-list',
    templateUrl: './items-list.component.html',
    styleUrl: './items-list.component.scss',
    imports: [NgStyle, FilterListComponent, SearchListComponent, ListComponent]
})
export class ItemsListComponent {
    @Input() width = 600;
}
