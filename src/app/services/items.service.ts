import { Injectable, signal } from "@angular/core";
import { Item } from "../types/item.type";

@Injectable({providedIn: 'root'})
export class ItemsService{
    readonly items = signal<Item[]>([]);
    readonly isLoading = signal(false);
    readonly searchQuery = signal('');
    readonly total = signal(0);

    setItems(items: Item[]) {
        this.items.set(items);
    }

    setLoading(value: boolean) {
        this.isLoading.set(value);
    }

    setSearchQuery(query: string) {
        this.searchQuery.set(query);
    }
}