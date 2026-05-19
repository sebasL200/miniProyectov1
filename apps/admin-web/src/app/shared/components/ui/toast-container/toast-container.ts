import { Component, computed, inject } from '@angular/core';
import { Z_INDEX } from '@shared/constants/z-index.const';
import { Toast } from './components/toast/toast';
import { ToastService } from '@shared/services/toast/toast.service';

@Component({
  selector: 'ecom-toast-container',
  imports: [Toast],
  templateUrl: './toast-container.html',
  styleUrl: './toast-container.css',
  host: {
    class: 'fixed inset-0 pointer-events-none',
    '[style.z-index]': 'zIndex',
  },
})
export class ToastContainer {

  private readonly toastService: ToastService = inject(ToastService);

  zIndex = Z_INDEX.TOAST;

  toasts = computed(() => this.toastService.toasts());

  constructor() {
  }

  onToastClosed(toastId: string) {
    this.toastService.removeToast(toastId);
  }
}
