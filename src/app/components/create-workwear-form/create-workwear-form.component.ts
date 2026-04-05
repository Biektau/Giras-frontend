import { Component, effect, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Actions, ofType } from "@ngrx/effects";
import { filter } from "rxjs";
import { Store } from "@ngrx/store";
import { WorkwearCategory } from "../../enums/workwear-category.enum";
import { WorkwearSize } from "../../enums/workwear-size.enum";
import { WorkwearSeason } from "../../enums/workwear-season.enum";
import { WorkwearItemSet } from "../../enums/workwear-set.enum";
import { CustomSelectComponent, SelectOption } from "../custom-select/custom-select.component";
import { TabService } from "../../services/tab.service";
import { FormStateService } from "../../services/form.service";
import { CategoryService } from "../../services/category.service";
import { Workwear } from "../../interfaces/workwear.interface";
import * as ItemsActions from "../../store/items/items.actions";

@Component({
    imports: [ReactiveFormsModule, CustomSelectComponent],
    selector: 'create-workwear-form',
    templateUrl: './create-workwear-form.component.html',
    styleUrl: './create-workwear-form.component.scss'
})
export class CreateWorkwearFormComponent {
    categorySelectOptions: SelectOption[] = Object.values(WorkwearCategory).map(c => ({ value: c, label: c }));
    sizeSelectOptions: SelectOption[] = Object.values(WorkwearSize).map(s => ({ value: s, label: s }));
    seasonSelectOptions: SelectOption[] = Object.values(WorkwearSeason).map(s => ({ value: s, label: s }));
    setSelectOptions: SelectOption[] = Object.values(WorkwearItemSet).map(s => ({ value: s, label: s }));

    existingImages: string[] = [];
    selectedFiles: File[] = [];
    newPreviews: string[] = [];

    get previews(): string[] {
        return [...this.existingImages, ...this.newPreviews];
    }

    private readonly fb = inject(FormBuilder);
    private readonly formStateService = inject(FormStateService);
    private readonly tabService = inject(TabService);
    private readonly categoryService = inject(CategoryService);
    private readonly store = inject(Store);
    private readonly actions$ = inject(Actions);

    readonly isEditMode = this.tabService.activeTab;

    workwearForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(200)]],
        description: [''],
        category: ['', Validators.required],
        size: [[] as string[], Validators.required],
        color: ['', [Validators.required, Validators.maxLength(100)]],
        season: ['', Validators.required],
        set: ['', Validators.required],
        price: ['', [Validators.required, Validators.min(0.01)]],
        sku: ['', [
            Validators.required,
            Validators.maxLength(50),
            Validators.pattern(/^[\p{L}0-9_-]+$/u)
        ]],
        isCertified: [false],
        material: ['', [Validators.required, Validators.maxLength(100)]]
    });

    constructor() {
        this.actions$.pipe(
            ofType(ItemsActions.createItemSuccess),
            filter(({ category }) => category === this.categoryService.current()),
            takeUntilDestroyed(),
        ).subscribe(() => {
            this.workwearForm.reset({ isCertified: false, size: [], category: '' });
            this.existingImages = [];
            this.selectedFiles = [];
            this.newPreviews = [];
        });

        effect(() => {
            const item = this.formStateService.selectedItem() as Workwear | null;

            if (item) {
                this.workwearForm.patchValue({
                    name: item.name,
                    description: item.description ?? '',
                    category: item.category,
                    size: item.size as string[],
                    color: item.color,
                    season: item.season,
                    set: item.set,
                    price: String(item.price),
                    sku: item.sku,
                    isCertified: item.isCertified,
                    material: item.material
                });
                this.existingImages = [...(item.images ?? [])];
                this.selectedFiles = [];
                this.newPreviews = [];
            } else {
                this.workwearForm.reset({ isCertified: false, size: [], category: '' });
                this.existingImages = [];
                this.selectedFiles = [];
                this.newPreviews = [];
            }
        });
    }

    onFilesSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (!input.files) return;

        const newFiles = Array.from(input.files);
        const total = this.selectedFiles.length + newFiles.length;

        if (total > 10) {
            alert('Максимум 10 изображений');
            return;
        }

        this.selectedFiles.push(...newFiles);

        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => this.newPreviews.push(e.target?.result as string);
            reader.readAsDataURL(file);
        });

        input.value = '';
    }

    removeFile(index: number): void {
        if (index < this.existingImages.length) {
            this.existingImages.splice(index, 1);
        } else {
            const newIndex = index - this.existingImages.length;
            this.selectedFiles.splice(newIndex, 1);
            this.newPreviews.splice(newIndex, 1);
        }
    }

    onSubmit(): void {
        if (this.workwearForm.invalid) {
            this.workwearForm.markAllAsTouched();
            return;
        }

        const formData = new FormData();
        const values = this.workwearForm.value;

        formData.append('name', values.name ?? '');
        formData.append('description', values.description ?? '');
        formData.append('category', values.category ?? '');
        formData.append('color', values.color ?? '');
        formData.append('season', values.season ?? '');
        formData.append('set', values.set ?? '');
        formData.append('price', String(values.price ?? ''));
        formData.append('sku', values.sku ?? '');
        formData.append('isCertified', String(values.isCertified ?? false));
        formData.append('material', values.material ?? '');

        (values.size ?? []).forEach(s => formData.append('size', s));
        this.existingImages.forEach(url => formData.append('existingImages', url));
        this.selectedFiles.forEach(file => formData.append('images', file));

        const selectedItem = this.formStateService.selectedItem() as Workwear | null;
        const category = this.categoryService.current();
        if (!category) {
            return;
        }

        if (selectedItem) {
            this.store.dispatch(
                ItemsActions.updateItem({ category, id: selectedItem.id, formData }),
            );
        } else {
            this.store.dispatch(ItemsActions.createItem({ category, formData }));
        }
    }

    resetForm(): void {
        this.formStateService.clear();
        this.tabService.setTab('create');
        this.workwearForm.reset({ isCertified: false, size: [], category: '' });
        this.existingImages = [];
        this.selectedFiles = [];
        this.newPreviews = [];
    }

    getErrorMessage(field: string): string {
        const control = this.workwearForm.get(field);
        if (!control?.errors || !control.touched) return '';

        if (control.errors['required']) {
            const labels: Record<string, string> = {
                name: 'Название обязательно',
                category: 'Категория обязательна',
                size: 'Размер обязателен',
                color: 'Цвет обязателен',
                season: 'Сезон обязателен',
                set: 'Комплектация обязательна',
                price: 'Цена обязательна',
                sku: 'Артикул обязателен',
                material: 'Материал обязателен',
            };
            return labels[field] ?? 'Поле обязательно';
        }
        if (control.errors['maxlength']) {
            return `Не более ${control.errors['maxlength'].requiredLength} символов`;
        }
        if (control.errors['min']) return 'Цена должна быть больше 0';
        if (control.errors['pattern']) return 'Буквы (в т.ч. кириллица), цифры, дефис и подчёркивание';

        return 'Некорректное значение';
    }
}
