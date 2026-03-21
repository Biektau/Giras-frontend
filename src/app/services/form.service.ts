import { Injectable, signal } from "@angular/core";
import { Item } from "../types/item.type";

@Injectable({ providedIn: 'root' })
export class FormStateService {
    readonly selectedItem = signal<Item | null>(null);

    select(item: Item) {
        this.selectedItem.set(item);
    }

    clear() {
        this.selectedItem.set(null);
    }
}