import { Component, computed, inject, signal, viewChild, ElementRef, NgZone, OnDestroy } from "@angular/core";
import { Store } from "@ngrx/store";
import { CategoryService } from "../../services/category.service";
import { FormStateService } from "../../services/form.service";
import { TabService } from "../../services/tab.service";
import { ItemsSearchQueryService } from "../../services/items-search-query.service";
import { Copy, LucideAngularModule, Trash2 } from "lucide-angular";
import { Item } from "../../types/item.type";
import * as ItemsActions from "../../store/items/items.actions";
import { itemsFeature } from "../../store/items/items.reducer";

const SCROLL_THRESHOLD = 60;
const SCROLL_MAX_SPEED = 14;

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
    imports: [LucideAngularModule]
})
export class ListComponent implements OnDestroy {
    private readonly store = inject(Store);
    private readonly categoryService = inject(CategoryService);
    private readonly formStateService = inject(FormStateService);
    private readonly tabService = inject(TabService);
    private readonly searchQuery = inject(ItemsSearchQueryService);
    private readonly zone = inject(NgZone);

    readonly selectedItem = this.formStateService.selectedItem;
    readonly category = this.categoryService.current;

    readonly Trash2 = Trash2;
    readonly Copy = Copy;

    readonly listRef = viewChild<ElementRef<HTMLElement>>('listRef');

    readonly draggableItemId = signal<string | null>(null);
    readonly draggedIndex = signal<number>(-1);
    readonly dragOverIndex = signal<number>(-1);

    private dragItemHeight = 0;
    private scrollSpeed = 0;
    private scrollRafId: number | null = null;

    private readonly itemsFromStore = this.store.selectSignal(itemsFeature.selectItems);
    private readonly loadedCategory = this.store.selectSignal(itemsFeature.selectLoadedCategory);
    private readonly loadedSearch = this.store.selectSignal(itemsFeature.selectLoadedSearch);
    private readonly loading = this.store.selectSignal(itemsFeature.selectLoading);
    private readonly pendingCategory = this.store.selectSignal(itemsFeature.selectPendingCategory);
    private readonly pendingSearch = this.store.selectSignal(itemsFeature.selectPendingSearch);

    readonly items = computed(() => {
        const cat = this.category();
        if (!cat || this.loadedCategory() !== cat) {
            return [];
        }
        if (this.loadedSearch() !== this.searchQuery.appliedSearch()) {
            return [];
        }
        return this.itemsFromStore();
    });

    readonly isLoading = computed(() => {
        const cat = this.category();
        return (
            !!cat &&
            this.loading() &&
            this.pendingCategory() === cat &&
            this.pendingSearch() === this.searchQuery.appliedSearch()
        );
    });

    onDelete(id: string, event: MouseEvent) {
        event.stopPropagation();
        const cat = this.category();
        if (!cat) return;
        this.store.dispatch(ItemsActions.deleteItem({ category: cat, id }));
    }

    onSelect(item: Item) {
        this.formStateService.select(item);
        this.tabService.setTab('update');
    }

    onCopy(id: string, event: MouseEvent) {
        event.stopPropagation();
        const cat = this.category();
        if (!cat) return;
        this.store.dispatch(ItemsActions.copyItem({ category: cat, id }));
    }

    onHandleMouseDown(itemId: string, event: MouseEvent) {
        event.stopPropagation();
        this.draggableItemId.set(itemId);
    }

    onDragStart(event: DragEvent, index: number) {
        if (this.draggableItemId() === null) {
            event.preventDefault();
            return;
        }
        const target = event.currentTarget as HTMLElement;
        this.dragItemHeight = target.offsetHeight + 6;
        this.draggedIndex.set(index);
        event.dataTransfer!.effectAllowed = 'move';
        setTimeout(() => target.classList.add('is-dragging'), 0);
    }

    onListDragOver(event: DragEvent) {
        event.preventDefault();
        event.dataTransfer!.dropEffect = 'move';

        const listEl = this.listRef()?.nativeElement;
        if (!listEl) return;

        const target = (event.target as HTMLElement).closest<HTMLElement>('.list-item');
        if (target) {
            const items = Array.from(listEl.querySelectorAll<HTMLElement>('.list-item'));
            const index = items.indexOf(target);
            if (index !== -1 && index !== this.draggedIndex()) {
                this.dragOverIndex.set(index);
            }
        }

        this.updateAutoScroll(event.clientY);
    }

    onDragLeave(event: DragEvent) {
        const related = event.relatedTarget as Node | null;
        const listEl = this.listRef()?.nativeElement;
        if (listEl && related && listEl.contains(related)) return;
        this.dragOverIndex.set(-1);
        this.stopAutoScroll();
    }

    onDrop(event: DragEvent) {
        event.preventDefault();
        const fromIndex = this.draggedIndex();
        const toIndex = this.dragOverIndex();
        if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
            return;
        }

        const cat = this.category();
        if (!cat) return;

        const list = [...this.items()];
        const [moved] = list.splice(fromIndex, 1);
        list.splice(toIndex, 0, moved);

        const payload = list.map((item, i) => ({ id: item.id, order: i }));
        this.store.dispatch(
            ItemsActions.reorderItems({
                category: cat,
                search: this.searchQuery.appliedSearch(),
                items: list,
                orderPayload: payload,
            }),
        );
    }

    onDragEnd(event: DragEvent) {
        (event.currentTarget as HTMLElement).classList.remove('is-dragging');
        this.draggedIndex.set(-1);
        this.dragOverIndex.set(-1);
        this.draggableItemId.set(null);
        this.stopAutoScroll();
    }

    getItemTransform(index: number): string {
        const from = this.draggedIndex();
        const to = this.dragOverIndex();
        if (from === -1 || to === -1 || from === to || index === from) return '';

        const h = this.dragItemHeight;
        if (from < to && index > from && index <= to) return `translateY(-${h}px)`;
        if (from > to && index >= to && index < from) return `translateY(${h}px)`;
        return '';
    }

    private updateAutoScroll(clientY: number) {
        const el = this.listRef()?.nativeElement;
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const topDist = clientY - rect.top;
        const bottomDist = rect.bottom - clientY;

        if (topDist < SCROLL_THRESHOLD) {
            this.scrollSpeed = -SCROLL_MAX_SPEED * (1 - topDist / SCROLL_THRESHOLD);
        } else if (bottomDist < SCROLL_THRESHOLD) {
            this.scrollSpeed = SCROLL_MAX_SPEED * (1 - bottomDist / SCROLL_THRESHOLD);
        } else {
            this.scrollSpeed = 0;
        }

        if (this.scrollSpeed !== 0 && this.scrollRafId === null) {
            this.startAutoScroll(el);
        } else if (this.scrollSpeed === 0) {
            this.stopAutoScroll();
        }
    }

    private startAutoScroll(el: HTMLElement) {
        this.zone.runOutsideAngular(() => {
            const tick = () => {
                if (this.scrollSpeed === 0) {
                    this.scrollRafId = null;
                    return;
                }
                el.scrollTop += this.scrollSpeed;
                this.scrollRafId = requestAnimationFrame(tick);
            };
            this.scrollRafId = requestAnimationFrame(tick);
        });
    }

    private stopAutoScroll() {
        if (this.scrollRafId !== null) {
            cancelAnimationFrame(this.scrollRafId);
            this.scrollRafId = null;
        }
        this.scrollSpeed = 0;
    }

    ngOnDestroy() {
        this.stopAutoScroll();
    }
}
