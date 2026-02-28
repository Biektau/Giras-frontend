import { Component, inject } from "@angular/core";
import { ResizeService } from "../../services/resize.service";

@Component({
    selector: 'app-resize-handle',
    templateUrl: './resize-handle.component.html',
    styleUrl: './resize-handle.component.scss'
})
export class ResizeHandleComponent {
    private readonly resizeService = inject(ResizeService);

    onMouseDown(event: MouseEvent) {
        this.resizeService.startResize(event);
    }
}