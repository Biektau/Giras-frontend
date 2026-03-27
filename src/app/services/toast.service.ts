import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

const TOAST_DURATION = 4000;

@Injectable({ providedIn: 'root' })
export class ToastService {
    readonly toasts = signal<Toast[]>([]);

    success(message: string): void {
        this.show(message, 'success');
    }

    error(message: string): void {
        this.show(message, 'error');
    }

    info(message: string): void {
        this.show(message, 'info');
    }

    warning(message: string): void {
        this.show(message, 'warning');
    }

    remove(id: string): void {
        this.toasts.update(list => list.filter(t => t.id !== id));
    }

    private show(message: string, type: ToastType): void {
        const id = `${Date.now()}-${Math.random()}`;
        this.toasts.update(list => [...list, { id, message, type }]);
        setTimeout(() => this.remove(id), TOAST_DURATION);
    }
}

export function extractErrorMessage(err: unknown, fallback: string): string {
    if (err && typeof err === 'object') {
        const e = err as Record<string, unknown>;
        if (e['error'] && typeof e['error'] === 'object') {
            const inner = e['error'] as Record<string, unknown>;
            if (typeof inner['message'] === 'string') return inner['message'];
        }
        if (typeof e['message'] === 'string') return e['message'];
    }
    return fallback;
}
