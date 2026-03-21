import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { ItemsService } from "./items.service";
import { Items } from "../types/item.type";
import { tap } from "rxjs";
import { Workwear } from "../interfaces/workwear.interface";

@Injectable({ providedIn: 'root' })
export class WorkwearService {
    private readonly http = inject(HttpClient);
    private readonly itemsService = inject(ItemsService);

    private readonly apiUrl = 'http://localhost:3000/api/workwear';

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

    deleteItem(id: string) {
        return this.http.delete(`${this.apiUrl}/delete-one/${id}`).pipe(
            tap(() => this.itemsService.removeItem(id))
        );
    }

    createItem(formData: FormData) {
        return this.http.post<Workwear>(`${this.apiUrl}/create-one`, formData).pipe(
            tap((newItem) => {
                this.itemsService.addItem(newItem);
            })
        );
    }

    copyItem(id: string) {
        return this.http.post<Workwear>(`${this.apiUrl}/copy-one/${id}`, {}).pipe(
            tap(newItem => this.itemsService.addItem(newItem))
        );
    }

    updateItem(id: string, formData: FormData) {
        return this.http.put<Workwear>(`${this.apiUrl}/update-one/${id}`, formData).pipe(
            tap((updatedItem) => this.itemsService.updateItem(updatedItem))
        );
    }
}