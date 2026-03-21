import { Component, inject, OnInit } from '@angular/core';
import { ItemsListComponent } from '../items-list/items-list.component';
import { ItemFormsComponent } from '../item-forms/item-forms.component';
import { ResizeService } from '../../services/resize.service';
import { ResizeHandleComponent } from '../resize-handle/resize-handle.component';
import { ActivatedRoute } from '@angular/router';
import { ItemsService } from '../../services/items.service';
import { WorkwearService } from '../../services/workwear.service';
import { ListEventsService } from '../../services/list-events.service';
import { Subscription } from 'rxjs';
import { FormStateService } from '../../services/form.service';
import { TabService } from '../../services/tab.service';

@Component({
    selector: 'app-constructor',
    templateUrl: './constructor.component.html',
    styleUrl: './constructor.component.scss',
    imports: [ItemsListComponent, ResizeHandleComponent, ItemFormsComponent],
})
export class ConstructorComponent implements OnInit {
    readonly resizeService = inject(ResizeService);
    readonly leftWidth = this.resizeService.leftWidth;

    private readonly route = inject(ActivatedRoute);
    private readonly itemsService = inject(ItemsService);
    private readonly workwearService = inject(WorkwearService);
    private readonly listEventsService = inject(ListEventsService);
    private readonly formStateService = inject(FormStateService);
    private readonly tabService = inject(TabService);

    private subscription = new Subscription();

    ngOnInit() {
        this.route.url.subscribe(segments => {
            const category = segments[0]?.path;
            this.formStateService.clear();
            this.tabService.setTab('create');
            this.loadByCategory(category);
        });

        this.subscription.add(
            this.listEventsService.delete$.subscribe(id => {
                this.deleteByCategory(id);
            })
        );

        this.subscription.add(
            this.listEventsService.select$.subscribe(item => {
                this.formStateService.select(item);
                this.tabService.setTab('update');
            })
        );

        this.subscription.add(
            this.listEventsService.copy$.subscribe(id => {
                this.copyByCategory(id);
            })
        );
    }

    private loadByCategory(category: string) {
        this.itemsService.setItems([]);
        switch (category) {
            case 'workwear':
                this.workwearService.loadItems()
                break;

            default: console.log(category);

        }
    }

    private deleteByCategory(id: string) {
        const category = this.route.snapshot.url[0]?.path;
        switch (category) {
            case 'workwear':
                this.workwearService.deleteItem(id).subscribe();
                break;
        }
    }

    private copyByCategory(id: string) {
        const category = this.route.snapshot.url[0]?.path;
        switch (category) {
            case 'workwear':
                this.workwearService.copyItem(id).subscribe();
                break;
        }
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
