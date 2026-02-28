import { Injectable, OnDestroy, signal } from "@angular/core";

const STORAGE_KEY = 'constructor-left-width';
const MIN_LEFT_WIDTH = 500;
const MIN_RIGHT_WIDTH = 500;

@Injectable({ providedIn: 'root' })
export class ResizeService implements OnDestroy {
    leftWidth = signal(this.loadWidth());
    isResizing = signal(false);

    private startX = 0;
    private startWidth = 0;

    private onMouseMove = (event: MouseEvent) => {
    if (!this.isResizing()) return;
    const delta = event.clientX - this.startX;
    const newWidth = this.startWidth + delta;
    const padding = 20; 
    const handleWidth = 16;
    const maxWidth = window.innerWidth - MIN_RIGHT_WIDTH - padding - handleWidth;
    this.leftWidth.set(Math.min(Math.max(newWidth, MIN_LEFT_WIDTH), maxWidth));
};

    private onMouseUp = () => {
        if (!this.isResizing()) return;
        this.isResizing.set(false);
        localStorage.setItem(STORAGE_KEY, String(this.leftWidth()));
        document.body.classList.remove('resizing');
    };

    constructor() {
        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    startResize(event: MouseEvent) {
        this.isResizing.set(true);
        this.startX = event.clientX;
        this.startWidth = this.leftWidth();
        document.body.classList.add('resizing');
        event.preventDefault();
    }

    private loadWidth(): number {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? Number(saved) : 800;
    }

    ngOnDestroy() {
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    }
}