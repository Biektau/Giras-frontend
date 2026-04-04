import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { ItemsListComponent } from '../items-list/items-list.component';
import { ItemFormsComponent } from '../item-forms/item-forms.component';
import { ResizeService } from '../../services/resize.service';
import { ResizeHandleComponent } from '../resize-handle/resize-handle.component';
import { ActivatedRoute } from '@angular/router';
import { FormStateService } from '../../services/form.service';
import { TabService } from '../../services/tab.service';
import { CategoryService } from '../../services/category.service';
import { ItemsSearchQueryService } from '../../services/items-search-query.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-constructor',
    templateUrl: './constructor.component.html',
    styleUrl: './constructor.component.scss',
    imports: [ItemsListComponent, ResizeHandleComponent, ItemFormsComponent],
})
export class ConstructorComponent implements OnInit, OnDestroy {
    readonly resizeService = inject(ResizeService);
    readonly leftWidth = this.resizeService.leftWidth;

    private readonly route = inject(ActivatedRoute);
    private readonly formStateService = inject(FormStateService);
    private readonly tabService = inject(TabService);
    private readonly categoryService = inject(CategoryService);
    private readonly itemsSearchQuery = inject(ItemsSearchQueryService);

    private routeSub?: Subscription;

    ngOnInit() {
        this.routeSub = this.route.url.subscribe(segments => {
            const category = segments[0]?.path ?? '';
            this.categoryService.set(category);
            this.itemsSearchQuery.reset();
            this.formStateService.clear();
            this.tabService.setTab('create');
        });
    }

    ngOnDestroy() {
        this.routeSub?.unsubscribe();
    }
}
