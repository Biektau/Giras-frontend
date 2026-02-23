import { Component } from "@angular/core";
import { ItemsListComponent } from "../../components/items-list/items-list.component";
import { ItemFormsComponent } from "../../components/item-forms/item-forms.component";

@Component({
    selector: 'app-constructor',
    templateUrl: './constructor.component.html',
    styleUrl: './constructor.component.scss',
    imports:[ItemsListComponent, ItemFormsComponent]
})
export class ConstructorComponent{}