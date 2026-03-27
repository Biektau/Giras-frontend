import { Component, inject, effect } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { WorkwearSize } from "../../enums/workwear-size.enum";
import { WorkwearSeason } from "../../enums/workwear-season.enum";
import { WorkwearItemSet } from "../../enums/workwear-set.enum";
import { CustomSelectComponent, SelectOption } from "../custom-select/custom-select.component";
import { WorkwearService } from "../../services/workwear.service";
import { Workwear } from "../../interfaces/workwear.interface";
import { TabService } from "../../services/tab.service";
import { FormStateService } from "../../services/form.service";
import { injectMutation, injectQueryClient } from "@tanstack/angular-query-experimental";
import { CategoryService } from "../../services/category.service";
import { QUERY_KEYS } from "../../query-keys";

@Component({
    imports: [ReactiveFormsModule, CustomSelectComponent],
    selector: 'create-workwear-form',
    templateUrl: './create-workwear-form.component.html',
    styleUrl: './create-workwear-form.component.scss'
})
export class CreateWorkwearFormComponent {
    sizeSelectOptions: SelectOption[] = Object.values(WorkwearSize).map(s => ({ value: s, label: s }));
    seasonSelectOptions: SelectOption[] = Object.values(WorkwearSeason).map(s => ({ value: s, label: s }));
    setSelectOptions: SelectOption[] = Object.values(WorkwearItemSet).map(s => ({ value: s, label: s }));

    selectedFiles: File[] = [];
    previews: string[] = [];

    private readonly fb = inject(FormBuilder);
    private readonly workwearService = inject(WorkwearService);
    private readonly formStateService = inject(FormStateService);
    private readonly tabService = inject(TabService);
    private readonly queryClient = injectQueryClient();
    private readonly categoryService = inject(CategoryService);

    readonly isEditMode = this.tabService.activeTab;

    workwearForm = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(200)]],
        description: [''],
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

    readonly createMutation = injectMutation(() => ({
        mutationFn: (formData: FormData) => this.workwearService.createItem(formData),
        onSuccess: () => {
            this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.items(this.categoryService.current()) });
            this.resetForm();
        },
        onError: (err: unknown) => console.error('Ошибка создания:', err)
    }));

    readonly updateMutation = injectMutation(() => ({
        mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
            this.workwearService.updateItem(id, formData),
        onSuccess: () => {
            this.queryClient.invalidateQueries({ queryKey: QUERY_KEYS.items(this.categoryService.current()) });
            this.formStateService.clear();
            this.tabService.setTab('create');
        },
        onError: (err: unknown) => console.error('Ошибка обновления:', err)
    }));

    constructor() {
        effect(() => {
            const item = this.formStateService.selectedItem() as Workwear | null;

            if (item) {
                this.workwearForm.patchValue({
                    name: item.name,
                    description: item.description ?? '',
                    size: item.size as string[],
                    color: item.color,
                    season: item.season,
                    set: item.set,
                    price: String(item.price),
                    sku: item.sku,
                    isCertified: item.isCertified,
                    material: item.material
                });
                this.previews = item.images ?? [];
            } else {
                this.workwearForm.reset({ isCertified: false, size: [] });
                this.selectedFiles = [];
                this.previews = [];
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
            reader.onload = (e) => this.previews.push(e.target?.result as string);
            reader.readAsDataURL(file);
        });

        input.value = '';
    }

    removeFile(index: number): void {
        this.selectedFiles.splice(index, 1);
        this.previews.splice(index, 1);
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
        formData.append('color', values.color ?? '');
        formData.append('season', values.season ?? '');
        formData.append('set', values.set ?? '');
        formData.append('price', String(values.price ?? ''));
        formData.append('sku', values.sku ?? '');
        formData.append('isCertified', String(values.isCertified ?? false));
        formData.append('material', values.material ?? '');

        (values.size ?? []).forEach(s => formData.append('size', s));
        this.selectedFiles.forEach(file => formData.append('images', file));

        const selectedItem = this.formStateService.selectedItem() as Workwear | null;

        if (selectedItem) {
            this.updateMutation.mutate({ id: selectedItem.id, formData });
        } else {
            this.createMutation.mutate(formData);
        }
    }

    resetForm(): void {
        this.formStateService.clear();
        this.tabService.setTab('create');
    }

    getErrorMessage(field: string): string {
        const control = this.workwearForm.get(field);
        if (!control?.errors || !control.touched) return '';

        if (control.errors['required']) {
            const labels: Record<string, string> = {
                name: 'Название обязательно',
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
