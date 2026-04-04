import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import {
    catchError,
    EMPTY,
    filter,
    from,
    map,
    mergeMap,
    of,
    switchMap,
    tap,
    withLatestFrom,
} from 'rxjs';
import { ItemsQueryService } from '../../services/items-query.service';
import { WorkwearService } from '../../services/workwear.service';
import { ToastService, extractErrorMessage } from '../../services/toast.service';
import * as ItemsActions from './items.actions';
import { itemsFeature } from './items.reducer';

@Injectable()
export class ItemsEffects {
    private readonly actions$ = inject(Actions);
    private readonly store = inject(Store);
    private readonly itemsQueryService = inject(ItemsQueryService);
    private readonly workwearService = inject(WorkwearService);
    private readonly toast = inject(ToastService);

    readonly loadItems$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ItemsActions.loadItems),
            switchMap(({ category, search }) => {
                if (!category) {
                    return EMPTY;
                }
                return from(this.itemsQueryService.fetchByCategory(category, search)).pipe(
                    map(items => ItemsActions.loadItemsSuccess({ category, search, items })),
                    catchError(err => {
                        const msg = extractErrorMessage(err, 'Ошибка загрузки');
                        this.toast.error(msg);
                        return of(ItemsActions.loadItemsFailure({ category, search }));
                    }),
                );
            }),
        ),
    );

    readonly deleteItem$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ItemsActions.deleteItem),
            mergeMap(({ category, id }) =>
                from(this.itemsQueryService.deleteByCategory(category, id)).pipe(
                    tap(() => this.toast.success('Элемент удалён')),
                    map(() => ItemsActions.deleteItemSuccess({ id })),
                    catchError(err => {
                        this.toast.error(extractErrorMessage(err, 'Ошибка удаления'));
                        return EMPTY;
                    }),
                ),
            ),
        ),
    );

    readonly copyItem$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ItemsActions.copyItem),
            mergeMap(({ category, id }) =>
                from(this.itemsQueryService.copyByCategory(category, id)).pipe(
                    tap(() => this.toast.success('Элемент скопирован')),
                    map(item => ItemsActions.copyItemSuccess({ category, item })),
                    catchError(err => {
                        this.toast.error(extractErrorMessage(err, 'Ошибка копирования'));
                        return EMPTY;
                    }),
                ),
            ),
        ),
    );

    readonly reorderItems$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ItemsActions.reorderItems),
            mergeMap(({ category, search, orderPayload }) =>
                from(this.itemsQueryService.reorderByCategory(category, orderPayload)).pipe(
                    mergeMap(() => {
                        this.toast.success('Порядок сохранён');
                        return of(ItemsActions.reorderItemsApiDone());
                    }),
                    catchError(err => {
                        this.toast.error(extractErrorMessage(err, 'Ошибка сортировки'));
                        return of(ItemsActions.loadItems({ category, search }));
                    }),
                ),
            ),
        ),
    );

    readonly refetchListWhenSearchingAfterMutation$ = createEffect(() =>
        this.actions$.pipe(
            ofType(
                ItemsActions.createItemSuccess,
                ItemsActions.copyItemSuccess,
                ItemsActions.updateItemSuccess,
            ),
            withLatestFrom(this.store.select(itemsFeature.selectLoadedSearch)),
            filter(([, loadedSearch]) => loadedSearch.length > 0),
            map(([action, search]) =>
                ItemsActions.loadItems({ category: action.category, search }),
            ),
        ),
    );

    readonly createItem$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ItemsActions.createItem),
            mergeMap(({ category, formData }) =>
                from(this.workwearService.createItem(formData)).pipe(
                    tap(() => this.toast.success('Элемент создан')),
                    map(item => ItemsActions.createItemSuccess({ category, item })),
                    catchError(err => {
                        this.toast.error(extractErrorMessage(err, 'Ошибка создания'));
                        return EMPTY;
                    }),
                ),
            ),
        ),
    );

    readonly updateItem$ = createEffect(() =>
        this.actions$.pipe(
            ofType(ItemsActions.updateItem),
            mergeMap(({ category, id, formData }) =>
                from(this.workwearService.updateItem(id, formData)).pipe(
                    tap(() => this.toast.success('Изменения сохранены')),
                    map(item => ItemsActions.updateItemSuccess({ category, item })),
                    catchError(err => {
                        this.toast.error(extractErrorMessage(err, 'Ошибка обновления'));
                        return EMPTY;
                    }),
                ),
            ),
        ),
    );
}
