import { Component, inject } from "@angular/core";
import { ItemsService } from "../../services/items.service";
import { Copy, LucideAngularModule, Trash2 } from "lucide-angular/src/icons";

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html',
    styleUrl: './list.component.scss',
    imports: [LucideAngularModule]
})
export class ListComponent {
    private readonly itemsService = inject(ItemsService);

    readonly items = this.itemsService.items;
    readonly isLoading = this.itemsService.isLoading;

    readonly Trash2 = Trash2;
    readonly Copy = Copy;

}