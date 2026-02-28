import { Component, inject } from "@angular/core";
import { ItemsListComponent } from "../../components/items-list/items-list.component";
import { ItemFormsComponent } from "../../components/item-forms/item-forms.component";
import { ResizeService } from "../../common/services/resize.service";
import { ResizeHandleComponent } from "../../common/components/resize-handle/resize-handle.component";

@Component({
    selector: 'app-constructor',
    templateUrl: './constructor.component.html',
    styleUrl: './constructor.component.scss',
    imports: [ItemsListComponent, ResizeHandleComponent, ItemFormsComponent]
})
export class ConstructorComponent {
    readonly resizeService = inject(ResizeService);
    readonly leftWidth = this.resizeService.leftWidth;
}