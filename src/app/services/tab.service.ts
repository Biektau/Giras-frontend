import { computed, Injectable, signal } from "@angular/core";

export type TabType = 'update' | 'create';

export interface Tab {
    id: TabType;
    label: string;
}

@Injectable({ providedIn: 'root' })
export class TabService {
    readonly tabs: Tab[] = [
        { id: 'update', label: 'Обновить' },
        { id: 'create', label: 'Создать' },
    ];

    private readonly activeTabSignal = signal<TabType>('create');
    readonly activeTab = this.activeTabSignal.asReadonly();

    readonly activeTabIndex = computed(() =>
        this.tabs.findIndex(t => t.id === this.activeTab())
    );

    setTab(tab: TabType) {
        this.activeTabSignal.set(tab);
    }
}