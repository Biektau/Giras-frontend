import { Component, inject, computed } from "@angular/core";
import { injectQuery, injectMutation, injectQueryClient } from "@tanstack/angular-query-experimental";
import { WorkwearService } from "../../services/workwear.service";
import { CategoryService } from "../../services/category.service";
import { FormStateService } from "../../services/form.service";
import { TabService } from "../../services/tab.service";
import { Copy, LucideAngularModule, Trash2 } from "lucide-angular";
import { Item } from "../../types/item.type";

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
    imports: [LucideAngularModule]
})
export class ListComponent {
    private readonly workwearService = inject(WorkwearService);
    private readonly categoryService = inject(CategoryService);
    private readonly queryClient = injectQueryClient();
    private readonly formStateService = inject(FormStateService);
    private readonly tabService = inject(TabService);

    readonly selectedItem = this.formStateService.selectedItem;
    readonly category = this.categoryService.current;

    readonly Trash2 = Trash2;
    readonly Copy = Copy;

    readonly itemsQuery = injectQuery(() => ({
        queryKey: ['items', this.category()],
        queryFn: () => this.fetchByCategory(this.category()),
        enabled: !!this.category()
    }));

    readonly deleteMutation = injectMutation(() => ({
        mutationFn: (id: string) => this.workwearService.deleteItem(id),
        onSuccess: () => this.queryClient.invalidateQueries({ queryKey: ['items', this.category()] })
    }));

    readonly copyMutation = injectMutation(() => ({
        mutationFn: (id: string) => this.workwearService.copyItem(id),
        onSuccess: () => this.queryClient.invalidateQueries({ queryKey: ['items', this.category()] })
    }));

    readonly items = computed(() => this.itemsQuery.data() ?? []);
    readonly isLoading = computed(() => this.itemsQuery.isPending());

    private fetchByCategory(category: string): Promise<Item[]> {
        switch (category) {
            case 'workwear': return this.workwearService.getAll();
            default: return Promise.resolve([]);
        }
    }

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
