import { Injectable, inject } from "@angular/core";
import { WorkwearService } from "./workwear.service";
import { Item } from "../types/item.type";

@Injectable({ providedIn: 'root' })
export class ItemsQueryService {
    private readonly workwearService = inject(WorkwearService);

    fetchByCategory(category: string, search: string): Promise<Item[]> {
        switch (category) {
            case 'workwear': return this.workwearService.getAll(search);
            default: return Promise.resolve([]);
        }
    }

    deleteByCategory(category: string, id: string): Promise<unknown> {
        switch (category) {
            case 'workwear': return this.workwearService.deleteItem(id);
            default: return Promise.reject(new Error(`Удаление для категории "${category}" не поддерживается`));
        }
    }

    copyByCategory(category: string, id: string): Promise<Item> {
        switch (category) {
            case 'workwear': return this.workwearService.copyItem(id);
            default: return Promise.reject(new Error(`Копирование для категории "${category}" не поддерживается`));
        }
    }

    reorderByCategory(category: string, items: { id: string; order: number }[]): Promise<void> {
        switch (category) {
            case 'workwear': return this.workwearService.reorderItems(items);
            default: return Promise.reject(new Error(`Сортировка для категории "${category}" не поддерживается`));
        }
    }
}
