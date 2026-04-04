import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { Workwear } from "../interfaces/workwear.interface";
import { Items } from "../types/item.type";

@Injectable({ providedIn: 'root' })
export class WorkwearService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = 'http://localhost:3000/api/workwear';

    getAll(search: string): Promise<Items> {
        let params = new HttpParams();
        if (search) {
            params = params.set('q', search);
        }
        return firstValueFrom(this.http.get<Items>(`${this.apiUrl}/get-all`, { params }));
    }

    deleteItem(id: string): Promise<unknown> {
        return firstValueFrom(this.http.delete(`${this.apiUrl}/delete-one/${id}`));
    }

    createItem(formData: FormData): Promise<Workwear> {
        return firstValueFrom(this.http.post<Workwear>(`${this.apiUrl}/create-one`, formData));
    }

    copyItem(id: string): Promise<Workwear> {
        return firstValueFrom(this.http.post<Workwear>(`${this.apiUrl}/copy-one/${id}`, {}));
    }

    updateItem(id: string, formData: FormData): Promise<Workwear> {
        return firstValueFrom(this.http.put<Workwear>(`${this.apiUrl}/update-one/${id}`, formData));
    }

    reorderItems(items: { id: string; order: number }[]): Promise<void> {
        return firstValueFrom(this.http.patch<void>(`${this.apiUrl}/reorder`, items));
    }
}
