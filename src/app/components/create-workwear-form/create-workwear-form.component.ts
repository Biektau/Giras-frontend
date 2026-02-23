import { Component, inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { WorkwearSize } from "../../common/enums/workwear-size.enum";
import { WorkwearSeason } from "../../common/enums/workwear-season.enum";
import { WorkwearItemSet } from "../../common/enums/workwear-set.enum";

@Component({
    imports: [ReactiveFormsModule],
    selector: 'create-workwear-form',
    templateUrl: './create-workwear-form.component.html',
    styleUrl: './create-workwear-form.component.scss'
})
export class CreateWorkwearFormComponent {
    sizeOptions = Object.values(WorkwearSize);
    seasonOptions = Object.values(WorkwearSeason);
    setOptions = Object.values(WorkwearItemSet);

    selectedFiles: File[] = [];
    previews: string[] = [];

    private fb = inject(FormBuilder);

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
            Validators.pattern(/^[A-Za-z0-9-_]+$/)
        ]],
        isCertified: [false],
        material: ['', [Validators.required, Validators.maxLength(100)]]
    });

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

    toggleSize(size: string): void {
        const current: string[] = this.workwearForm.get('size')?.value ?? [];
        const updated = current.includes(size)
            ? current.filter(s => s !== size)
            : [...current, size];
        this.workwearForm.get('size')?.setValue(updated);
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

        console.log(formData);
        this.resetForm();
    }

    resetForm(): void {
        this.workwearForm.reset({ isCertified: false, size: [] });
        this.selectedFiles = [];
        this.previews = [];
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
        if (control.errors['pattern']) return 'Только буквы, цифры, дефисы и подчёркивания';

        return 'Некорректное значение';
    }
}