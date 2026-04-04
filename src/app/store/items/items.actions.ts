import { createAction, props } from '@ngrx/store';
import { Item } from '../../types/item.type';

export const loadItems = createAction(
    '[Items] Load',
    props<{ category: string; search: string }>(),
);

export const loadItemsSuccess = createAction(
    '[Items] Load Success',
    props<{ category: string; search: string; items: Item[] }>(),
);

export const loadItemsFailure = createAction(
    '[Items] Load Failure',
    props<{ category: string; search: string }>(),
);

export const deleteItem = createAction('[Items] Delete', props<{ category: string; id: string }>());

export const deleteItemSuccess = createAction('[Items] Delete Success', props<{ id: string }>());

export const copyItem = createAction('[Items] Copy', props<{ category: string; id: string }>());

export const copyItemSuccess = createAction(
    '[Items] Copy Success',
    props<{ category: string; item: Item }>(),
);

export const reorderItems = createAction(
    '[Items] Reorder',
    props<{
        category: string;
        search: string;
        items: Item[];
        orderPayload: { id: string; order: number }[];
    }>(),
);

export const reorderItemsApiDone = createAction('[Items] Reorder API Done');

export const createItem = createAction(
    '[Items] Create',
    props<{ category: string; formData: FormData }>(),
);

export const createItemSuccess = createAction(
    '[Items] Create Success',
    props<{ category: string; item: Item }>(),
);

export const updateItem = createAction(
    '[Items] Update',
    props<{ category: string; id: string; formData: FormData }>(),
);

export const updateItemSuccess = createAction(
    '[Items] Update Success',
    props<{ category: string; item: Item }>(),
);
