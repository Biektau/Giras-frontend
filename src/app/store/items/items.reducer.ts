import { createFeature, createReducer, on } from '@ngrx/store';
import { Item } from '../../types/item.type';
import * as ItemsActions from './items.actions';

export interface ItemsState {
    items: Item[];
    loading: boolean;
    pendingCategory: string | null;
    pendingSearch: string;
    loadedCategory: string | null;
    loadedSearch: string;
}

export const initialItemsState: ItemsState = {
    items: [],
    loading: false,
    pendingCategory: null,
    pendingSearch: '',
    loadedCategory: null,
    loadedSearch: '',
};

const itemsReducer = createReducer(
    initialItemsState,
    on(ItemsActions.loadItems, (state, { category, search }) => {
        const shouldClear =
            state.loadedCategory !== category || state.loadedSearch !== search;
        return {
            ...state,
            loading: true,
            pendingCategory: category,
            pendingSearch: search,
            items: shouldClear ? [] : state.items,
        };
    }),
    on(ItemsActions.loadItemsSuccess, (state, { category, search, items }) =>
        state.pendingCategory === category && state.pendingSearch === search
            ? {
                  ...state,
                  items,
                  loading: false,
                  loadedCategory: category,
                  loadedSearch: search,
                  pendingCategory: null,
                  pendingSearch: '',
              }
            : state,
    ),
    on(ItemsActions.loadItemsFailure, (state, { category, search }) =>
        state.pendingCategory === category && state.pendingSearch === search
            ? {
                  ...state,
                  loading: false,
                  pendingCategory: null,
                  pendingSearch: '',
              }
            : state,
    ),
    on(ItemsActions.deleteItemSuccess, (state, { id }) => ({
        ...state,
        items: state.items.filter(i => i.id !== id),
    })),
    on(ItemsActions.copyItemSuccess, (state, { category, item }) =>
        state.loadedCategory === category
            ? {
                  ...state,
                  items: [...state.items, item].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
              }
            : state,
    ),
    on(ItemsActions.reorderItems, (state, { category, items }) =>
        state.loadedCategory === category ? { ...state, items } : state,
    ),
    on(ItemsActions.createItemSuccess, (state, { category, item }) =>
        state.loadedCategory === category ? { ...state, items: [...state.items, item] } : state,
    ),
    on(ItemsActions.updateItemSuccess, (state, { category, item }) =>
        state.loadedCategory === category
            ? { ...state, items: state.items.map(i => (i.id === item.id ? item : i)) }
            : state,
    ),
);

export const itemsFeature = createFeature({
    name: 'items',
    reducer: itemsReducer,
});
