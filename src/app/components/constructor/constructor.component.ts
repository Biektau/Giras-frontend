import { Component, inject, OnInit } from '@angular/core';
import { ItemsListComponent } from '../items-list/items-list.component';
import { ItemFormsComponent } from '../item-forms/item-forms.component';
import { ResizeService } from '../../services/resize.service';
import { ResizeHandleComponent } from '../resize-handle/resize-handle.component';
import { ActivatedRoute } from '@angular/router';
import { ItemsService } from '../../services/items.service';
import { WorkwearService } from '../../services/workwear.service';

@Component({
  selector: 'app-constructor',
  templateUrl: './constructor.component.html',
  styleUrl: './constructor.component.scss',
  imports: [ItemsListComponent, ResizeHandleComponent, ItemFormsComponent],
})
export class ConstructorComponent implements OnInit{
  readonly resizeService = inject(ResizeService);
  readonly leftWidth = this.resizeService.leftWidth;

  private readonly route = inject(ActivatedRoute);
  private readonly itemsService = inject(ItemsService);
  private readonly workwearService = inject(WorkwearService);

    ngOnInit(){
        this.route.url.subscribe(segments => {
            const category = segments[0]?.path;
            this.loadByCategory(category);
        })
    }

    private loadByCategory(category: string){
        this.itemsService.setItems([]);
        switch (category) {
            case 'workwear':
                this.workwearService.loadItems()
                break;

            default: console.log(category);
            
        }
    }
}
