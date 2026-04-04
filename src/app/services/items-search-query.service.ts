import { Injectable, signal } from '@angular/core';
import { Subject, of, timer } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';

const MAX_LEN = 200;

export function normalizeItemsSearchQuery(raw: string): string {
    return raw.trim().slice(0, MAX_LEN);
}

type SearchEvent = { type: 'input'; value: string } | { type: 'clear' };

@Injectable({ providedIn: 'root' })
export class ItemsSearchQueryService {
    readonly draft = signal('');

    readonly appliedSearch = signal('');

    private readonly events = new Subject<SearchEvent>();

    constructor() {
        this.events
            .pipe(
                switchMap(event => {
                    if (event.type === 'clear') {
                        return of('');
                    }
                    return timer(220).pipe(map(() => normalizeItemsSearchQuery(event.value)));
                }),
                distinctUntilChanged(),
            )
            .subscribe(s => this.appliedSearch.set(s));
    }

    onInput(raw: string): void {
        this.draft.set(raw);
        this.events.next({ type: 'input', value: raw });
    }

    clear(): void {
        this.draft.set('');
        this.events.next({ type: 'clear' });
    }

    reset(): void {
        this.clear();
    }
}
