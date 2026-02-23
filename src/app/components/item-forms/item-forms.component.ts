import { Component, inject } from "@angular/core";
import { TabService, TabType } from "../../common/services/tab.service";
import { CreateWorkwearFormComponent } from "../create-workwear-form/create-workwear-form.component";

@Component({
    imports: [CreateWorkwearFormComponent],
    selector: 'app-item-forms',
    templateUrl: './item-forms.component.html',
    styleUrl: './item-forms.component.scss'
})
export class ItemFormsComponent {
    private readonly tabService = inject(TabService);

    readonly tabs = this.tabService.tabs;
    readonly activeTab = this.tabService.activeTab;
    readonly activeTabIndex = this.tabService.activeTabIndex;


    setTab(tab: TabType) {
        this.tabService.setTab(tab);
    }
}