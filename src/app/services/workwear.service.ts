import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ItemsService } from "./items.service";
import { Items } from "../types/item.type";

@Injectable({ providedIn: 'root' })
export class WorkwearService {
    private readonly http = inject(HttpClient);
    private readonly itemsService = inject(ItemsService);

    private readonly apiUrl = 'http://localhost:7000/api/workwear';

    loadItems() {
        this.itemsService.setLoading(true);
        return this.http.get<Items>(`${this.apiUrl}/get-all`).subscribe({
            next: (data) => {
                this.itemsService.setItems(data);
                this.itemsService.setLoading(false);
            },
            error: () => this.itemsService.setLoading(false)
        });
    }

    deleteItem(id: number) {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    createItem(formData: FormData) {
        return this.http.post(this.apiUrl, formData);
    }

    updateItem(id: number, formData: FormData) {
        return this.http.put(`${this.apiUrl}/${id}`, formData);
    }
}