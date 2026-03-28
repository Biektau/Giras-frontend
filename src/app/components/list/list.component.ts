import { Component, inject, computed, signal, viewChild, ElementRef, NgZone, OnDestroy } from "@angular/core";
import { injectQuery, injectMutation, injectQueryClient } from "@tanstack/angular-query-experimental";
import { ItemsQueryService } from "../../services/items-query.service";
import { CategoryService } from "../../services/category.service";
import { FormStateService } from "../../services/form.service";
import { TabService } from "../../services/tab.service";
import { ToastService, extractErrorMessage } from "../../services/toast.service";
import { Copy, LucideAngularModule, Trash2 } from "lucide-angular";
import { Item } from "../../types/item.type";
import { QUERY_KEYS } from "../../query-keys";

const SCROLL_THRESHOLD = 60;
const SCROLL_MAX_SPEED = 14;

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
    imports: [LucideAngularModule]
})
export class ListComponent implements OnDestroy {
    private readonly itemsQueryService = inject(ItemsQueryService);
    private readonly categoryService = inject(CategoryService);
    private readonly queryClient = injectQueryClient();
    private readonly formStateService = inject(FormStateService);
    private readonly tabService = inject(TabService);
    private readonly toast = inject(ToastService);
    private readonly zone = inject(NgZone);

    readonly selectedItem = this.formStateService.selectedItem;
    readonly category = this.categoryService.current;

    readonly Trash2 = Trash2;
    readonly Copy = Copy;

    readonly listRef = viewChild<ElementRef<HTMLElement>>('listRef');

    // ── DnD state ──────────────────────────────────────────────
    readonly draggableItemId = signal<string | null>(null);
    readonly draggedIndex = signal<number>(-1);
    readonly dragOverIndex = signal<number>(-1);

    private dragItemHeight = 0;
    private scrollSpeed = 0;
    private scrollRafId: number | null = null;

    // ── Queries & mutations ────────────────────────────────────
    readonly itemsQuery = injectQuery(() => ({
        queryKey: QUERY_KEYS.items(this.category()),
        queryFn: () => this.itemsQueryService.fetchByCategory(this.category()),
        enabled: !!this.category()
    }));

    readonly deleteMutation = injectMutation(() => ({
        mutationFn: (id: string) => this.itemsQueryService.deleteByCategory(this.category(), id),
        onSuccess: (_data: unknown, id: string) => {
            this.queryClient.setQueryData<Item[]>(
                QUERY_KEYS.items(this.category()),
                (old = []) => old.filter(i => i.id !== id),
            );
            this.toast.success('Элемент удалён');
        },
        onError: (err: unknown) => this.toast.error(extractErrorMessage(err, 'Ошибка удаления'))
    }));

    readonly copyMutation = injectMutation(() => ({
        mutationFn: (id: string) => this.itemsQueryService.copyByCategory(this.category(), id),
        onSuccess: (newItem: Item) => {
            this.queryClient.setQueryData<Item[]>(
                QUERY_KEYS.items(this.category()),
                (old = []) => {
                    const merged = [...old, newItem];
                    merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                    return merged;
                },
            );
            this.toast.success('Элемент скопирован');
        },
        onError: (err: unknown) => this.toast.error(extractErrorMessage(err, 'Ошибка копирования'))
    }));

    readonly reorderMutation = injectMutation(() => ({
        mutationFn: (items: { id: string; order: number }[]) =>
            this.itemsQueryService.reorderByCategory(this.category(), items),
        onSuccess: () => this.toast.success('Порядок сохранён'),
        onError: (err: unknown) => {
            this.toast.error(extractErrorMessage(err, 'Ошибка сортировки'));
            this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.items(this.category()) });
        }
    }));

    readonly items = computed(() => this.itemsQuery.data() ?? []);
    readonly isLoading = computed(() => this.itemsQuery.isPending());

    // ── List actions ───────────────────────────────────────────
    onDelete(id: string, event: MouseEvent) {
        event.stopPropagation();
        this.deleteMutation.mutate(id);
    }

    onSelect(item: Item) {
        this.formStateService.select(item);
        this.tabService.setTab('update');
    }

    onCopy(id: string, event: MouseEvent) {
        event.stopPropagation();
        this.copyMutation.mutate(id);
    }

    // ── DnD ────────────────────────────────────────────────────
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

        const list = [...this.items()];
        const [moved] = list.splice(fromIndex, 1);
        list.splice(toIndex, 0, moved);

        this.queryClient.setQueryData<Item[]>(QUERY_KEYS.items(this.category()), list);

        const payload = list.map((item, i) => ({ id: item.id, order: i }));
        this.reorderMutation.mutate(payload);
    }

    onDragEnd(event: DragEvent) {
        (event.currentTarget as HTMLElement).classList.remove('is-dragging');
        this.draggedIndex.set(-1);
        this.dragOverIndex.set(-1);
        this.draggableItemId.set(null);
        this.stopAutoScroll();
    }

    // ── Item shift transform ───────────────────────────────────
    getItemTransform(index: number): string {
        const from = this.draggedIndex();
        const to = this.dragOverIndex();
        if (from === -1 || to === -1 || from === to || index === from) return '';

        const h = this.dragItemHeight;
        if (from < to && index > from && index <= to) return `translateY(-${h}px)`;
        if (from > to && index >= to && index < from) return `translateY(${h}px)`;
        return '';
    }

    // ── Auto-scroll ────────────────────────────────────────────
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
