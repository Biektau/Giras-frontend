import { Component, inject } from "@angular/core";
import { ItemsService } from "../../services/items.service";
import { ListEventsService } from "../../services/list-events.service";
import { Copy, LucideAngularModule, Trash2 } from "lucide-angular";
import { Item } from "../../types/item.type";
import { FormStateService } from "../../services/form.service";

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
    imports: [LucideAngularModule]
})
export class ListComponent {
    private readonly itemsService = inject(ItemsService);
    private readonly listEventsService = inject(ListEventsService);

    private readonly formStateService = inject(FormStateService);
    readonly selectedItem = this.formStateService.selectedItem;

    readonly items = this.itemsService.items;
    readonly isLoading = this.itemsService.isLoading;

    readonly Trash2 = Trash2;
    readonly Copy = Copy;

    onDelete(id: string, event: MouseEvent) {
        event.stopPropagation();

        this.listEventsService.emitDelete(id);
    }

    onSelect(item: Item) {
        this.listEventsService.emitSelect(item);
    }

    onCopy(id: string, event: MouseEvent) {
        event.stopPropagation();
        this.listEventsService.emitCopy(id);
    }
}