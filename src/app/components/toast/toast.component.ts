import { Component, inject } from '@angular/core';
import { LucideAngularModule, CheckCircle2, XCircle, Info, AlertTriangle, X, LucideIconData } from 'lucide-angular';
import { ToastService, ToastType } from '../../services/toast.service';

const TYPE_ICONS: Record<ToastType, LucideIconData> = {
    success: CheckCircle2,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
};

@Component({
    selector: 'app-toast',
    templateUrl: './toast.component.html',
    styleUrl: './toast.component.scss',
    imports: [LucideAngularModule],
})
export class ToastComponent {
    readonly toastService = inject(ToastService);
    readonly X = X;

    getIcon(type: ToastType): LucideIconData {
        return TYPE_ICONS[type];
    }
}
