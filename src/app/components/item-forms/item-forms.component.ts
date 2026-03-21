import { Component, inject } from "@angular/core";
import { TabService, TabType } from "../../services/tab.service";
import { CreateWorkwearFormComponent } from "../create-workwear-form/create-workwear-form.component";
import { FormStateService } from "../../services/form.service";

@Component({
    imports: [CreateWorkwearFormComponent],
    selector: 'app-item-forms',
    templateUrl: './item-forms.component.html',
    styleUrl: './item-forms.component.scss'
})
export class ItemFormsComponent {
    private readonly tabService = inject(TabService);
    private readonly formStateService = inject(FormStateService);

    readonly tabs = this.tabService.tabs;
    readonly activeTab = this.tabService.activeTab;
    readonly activeTabIndex = this.tabService.activeTabIndex;
    readonly selectedItem = this.formStateService.selectedItem;

    onTabClick(tab: TabType) {
        if (tab === 'update' && !this.selectedItem()) return; 
        if (tab === 'create') this.formStateService.clear(); 
        this.tabService.setTab(tab);
    }
}