import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: 'root' })
export class CategoryService {
    readonly current = signal<string>('');

    set(category: string) {
        this.current.set(category);
    }
}
