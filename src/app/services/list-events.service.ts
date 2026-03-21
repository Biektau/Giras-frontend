import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Item } from "../types/item.type";

@Injectable({ providedIn: 'root' })
export class ListEventsService {
    private readonly deleteSubject = new Subject<string>();
    readonly delete$ = this.deleteSubject.asObservable();

    private readonly selectSubject = new Subject<Item>();
    readonly select$ = this.selectSubject.asObservable();

    emitDelete(id: string) {
        this.deleteSubject.next(id);
    }

    emitSelect(item: Item) {
        this.selectSubject.next(item);
    }
}