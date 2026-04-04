import { Component, computed, inject } from "@angular/core";
import { ItemsSearchQueryService } from "../../services/items-search-query.service";
import { LucideAngularModule, Search, X } from "lucide-angular";

@Component({
    selector: 'app-search-list',
    templateUrl: './search-list.component.html',
    styleUrl: './search-list.component.scss',
    imports: [LucideAngularModule],
})
export class SearchListComponent {
    readonly search = inject(ItemsSearchQueryService);
    readonly SearchIcon = Search;
    readonly XIcon = X;

    readonly showClear = computed(() => this.search.draft().length > 0);

    onInput(value: string): void {
        this.search.onInput(value);
    }

    clear(event: Event): void {
        event.preventDefault();
        event.stopPropagation();
        this.search.clear();
    }
}
