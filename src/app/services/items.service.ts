import { Injectable, signal } from "@angular/core";
import { Items } from "../types/item.type";

@Injectable({providedIn: 'root'})
export class ItemsService{
    readonly items = signal<Items>([]);
    readonly isLoading = signal(false);
    readonly searchQuery = signal('');
    readonly total = signal(0);

    setItems(items: Items) {
        this.items.set(items);
    }

    setLoading(value: boolean) {
        this.isLoading.set(value);
    }

    setSearchQuery(query: string) {
        this.searchQuery.set(query);
    }
}