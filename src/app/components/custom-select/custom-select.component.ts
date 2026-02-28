import {
  Component,
  Input,
  forwardRef,
  signal,
  HostListener,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface SelectOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-custom-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './custom-select.component.html',
  styleUrl: './custom-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true,
    },
  ],
})
export class CustomSelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Выберите...';
  @Input() multiple = false;

  isOpen = signal(false);
  private _value: any = null;
  private onChange = (_: any) => {};
  private onTouched = () => {};

  get displayValue(): string {
    if (this.multiple) {
      const selected = this._value as (string | number)[];
      if (!selected || selected.length === 0) return this.placeholder;
      if (selected.length === 1) {
        return this.options.find(o => o.value === selected[0])?.label ?? this.placeholder;
      }
      return `Выбрано: ${selected.length}`;
    }
    if (this._value === null || this._value === undefined || this._value === '') return this.placeholder;
    return this.options.find(o => o.value === this._value)?.label ?? this.placeholder;
  }

  get hasValue(): boolean {
    if (this.multiple) return this._value?.length > 0;
    return this._value !== null && this._value !== undefined && this._value !== '';
  }

  toggle() {
    this.isOpen.update(v => !v);
    this.onTouched();
  }

  isSelected(value: string | number): boolean {
    if (this.multiple) return (this._value as any[])?.includes(value);
    return this._value === value;
  }

  select(value: string | number) {
    if (this.multiple) {
      const current = [...(this._value || [])];
      const idx = current.indexOf(value);
      if (idx === -1) current.push(value);
      else current.splice(idx, 1);
      this._value = current;
    } else {
      this._value = value;
      this.isOpen.set(false);
    }
    this.onChange(this._value);
  }

  clear(event: Event) {
    event.stopPropagation();
    this._value = this.multiple ? [] : null;
    this.onChange(this._value);
  }

  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('app-custom-select')) {
      this.isOpen.set(false);
    }
  }

  writeValue(value: any) {
    this._value = value ?? (this.multiple ? [] : null);
  }

  registerOnChange(fn: any) { this.onChange = fn; }
  registerOnTouched(fn: any) { this.onTouched = fn; }
}