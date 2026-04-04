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

function messageFromBackendBody(body: unknown): string | null {
    if (body == null || body === '') {
        return null;
    }
    if (typeof body === 'string') {
        const t = body.trim();
        if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
            try {
                return messageFromBackendBody(JSON.parse(t) as unknown);
            } catch {
                return t || null;
            }
        }
        return t || null;
    }
    if (typeof body !== 'object') {
        return null;
    }
    const o = body as Record<string, unknown>;
    const msg = o['message'];
    if (typeof msg === 'string' && msg.trim()) {
        return msg.trim();
    }
    if (Array.isArray(msg) && msg.length > 0) {
        const lines = msg.filter((x): x is string => typeof x === 'string').map(s => s.trim()).filter(Boolean);
        if (lines.length) {
            return lines.join('. ');
        }
    }
    return null;
}

export function extractErrorMessage(err: unknown, fallback: string): string {
    if (!err || typeof err !== 'object') {
        return fallback;
    }
    const e = err as Record<string, unknown>;

    const fromBody = messageFromBackendBody(e['error']);
    if (fromBody) {
        return fromBody;
    }

    const direct = messageFromBackendBody(e);
    if (direct) {
        return direct;
    }

    const topMsg = e['message'];
    if (typeof topMsg === 'string' && topMsg.trim() && !topMsg.startsWith('Http failure response')) {
        return topMsg.trim();
    }

    return fallback;
}
