import { Component, Input, effect, inject } from "@angular/core";
import { NgStyle } from "@angular/common";
import { Store } from "@ngrx/store";
import { SearchListComponent } from "../search-list/search-list.component";
import { ListComponent } from "../list/list.component";
import { CategoryService } from "../../services/category.service";
import { ItemsSearchQueryService } from "../../services/items-search-query.service";
import * as ItemsActions from "../../store/items/items.actions";

@Component({
    selector: 'app-items-list',
    templateUrl: './items-list.component.html',
    styleUrl: './items-list.component.scss',
    imports: [NgStyle, SearchListComponent, ListComponent]
})
export class ItemsListComponent {
    @Input() width = 600;

    private readonly store = inject(Store);
    private readonly category = inject(CategoryService).current;
    private readonly searchQuery = inject(ItemsSearchQueryService);

    constructor() {
        effect(() => {
            const cat = this.category();
            const search = this.searchQuery.appliedSearch();
            if (cat) {
                this.store.dispatch(ItemsActions.loadItems({ category: cat, search }));
            }
        });
    }
}
