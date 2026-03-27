import { Component, inject, computed } from "@angular/core";
import { injectQuery, injectMutation, injectQueryClient } from "@tanstack/angular-query-experimental";
import { ItemsQueryService } from "../../services/items-query.service";
import { CategoryService } from "../../services/category.service";
import { FormStateService } from "../../services/form.service";
import { TabService } from "../../services/tab.service";
import { ToastService, extractErrorMessage } from "../../services/toast.service";
import { Copy, LucideAngularModule, Trash2 } from "lucide-angular";
import { Item } from "../../types/item.type";
import { QUERY_KEYS } from "../../query-keys";

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
    imports: [LucideAngularModule]
})
export class ListComponent {
    private readonly itemsQueryService = inject(ItemsQueryService);
    private readonly categoryService = inject(CategoryService);
    private readonly queryClient = injectQueryClient();
    private readonly formStateService = inject(FormStateService);
    private readonly tabService = inject(TabService);
    private readonly toast = inject(ToastService);

    readonly selectedItem = this.formStateService.selectedItem;
    readonly category = this.categoryService.current;

    readonly Trash2 = Trash2;
    readonly Copy = Copy;

    readonly itemsQuery = injectQuery(() => ({
        queryKey: QUERY_KEYS.items(this.category()),
        queryFn: () => this.itemsQueryService.fetchByCategory(this.category()),
        enabled: !!this.category()
    }));

    readonly deleteMutation = injectMutation(() => ({
        mutationFn: (id: string) => this.itemsQueryService.deleteByCategory(this.category(), id),
        onSuccess: () => {
            this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.items(this.category()) });
            this.toast.success('Элемент удалён');
        },
        onError: (err: unknown) => this.toast.error(extractErrorMessage(err, 'Ошибка удаления'))
    }));

    readonly copyMutation = injectMutation(() => ({
        mutationFn: (id: string) => this.itemsQueryService.copyByCategory(this.category(), id),
        onSuccess: () => {
            this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.items(this.category()) });
            this.toast.success('Элемент скопирован');
        },
        onError: (err: unknown) => this.toast.error(extractErrorMessage(err, 'Ошибка копирования'))
    }));

    readonly items = computed(() => this.itemsQuery.data() ?? []);
    readonly isLoading = computed(() => this.itemsQuery.isPending());

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
}
