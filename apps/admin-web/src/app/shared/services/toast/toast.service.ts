import { Injectable, signal } from '@angular/core';
import { ToastConfig } from '@shared/components/ui/toast-container/models/toast-config';
import { ToastItem } from '@shared/components/ui/toast-container/models/toast-item';

const MAX_VISIBLE_TOASTS = 4;

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toasts = signal<ToastItem[]>([]);

  showSuccess(message: string, title?: string) {
    const id = this.generateId();
    const config: ToastConfig = new ToastConfig({ type: 'success', message: message });
    const newToast: ToastItem = new ToastItem(id, title, config);
    this.toasts.update((toasts) => [newToast, ...toasts].slice(0, MAX_VISIBLE_TOASTS));
  }

  showError(message: string, title?: string) {
    const id = this.generateId();
    const config: ToastConfig = new ToastConfig({ type: 'error', message: message });
    const newToast: ToastItem = new ToastItem(id, title, config);
    this.toasts.update((toasts) => [newToast, ...toasts].slice(0, MAX_VISIBLE_TOASTS));
  }

  removeToast(id: string) {
    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== id));
  }

  private generateId(): string {
    return crypto.randomUUID();
  }
}
