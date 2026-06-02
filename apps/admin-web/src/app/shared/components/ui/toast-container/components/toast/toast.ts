import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
import { Button } from '../../../button/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faX } from '@fortawesome/free-solid-svg-icons';
import { buildToastClasses, buildToastCloseButtonClasses } from './toast.styles';
import { ToastStatus, ToastType } from './toast.types';
import { TOAST_AUTO_CLOSE_DELAY_MS, TOAST_CLOSE_ANIMATION_MS } from '../../consts/toasts.consts';



@Component({
  selector: 'ecom-toast',
  imports: [Button, FaIconComponent],
  templateUrl: './toast.html',
  styleUrl: './toast.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[attr.data-status]': 'status()',
    '[attr.data-type]': 'type()',
  },
})
export class Toast {
  private readonly destroyRef = inject(DestroyRef);
  private openTimerId: ReturnType<typeof setTimeout> | null = null;
  private autoCloseTimerId: ReturnType<typeof setTimeout> | null = null;
  private closeTimerId: ReturnType<typeof setTimeout> | null = null;

  readonly faX = faX;
  readonly type = input<ToastType>('success');
  readonly message = input.required<string>();
  readonly status = signal<ToastStatus>('opening');
  readonly hostClasses = computed(() =>
    buildToastClasses({
      status: this.status(),
      type: this.type(),
    }),
  );
  readonly closeButtonClasses = computed(() =>
    buildToastCloseButtonClasses({
      type: this.type(),
    }),
  );

  readonly closed = output<void>();

  constructor() {
    this.destroyRef.onDestroy(() => this.clearTimers());

    // Deja que el DOM renderice primero con el estado inicial antes de animar la entrada.
    this.openTimerId = setTimeout(() => {
      this.openTimerId = null;

      if (this.status() === 'opening') {
        this.status.set('open');
      }
    }, 0);

    this.autoCloseTimerId = setTimeout(() => {
      this.autoCloseTimerId = null;
      this.close();
    }, TOAST_AUTO_CLOSE_DELAY_MS);
  }

  close() {
    if (this.status() === 'closing' || this.status() === 'closed') {
      return;
    }

    this.clearTimers();
    this.status.set('closing');

    this.closeTimerId = setTimeout(() => {
      this.closeTimerId = null;
      this.status.set('closed');
      this.closed.emit();
    }, TOAST_CLOSE_ANIMATION_MS);
  }

  private clearTimers() {
    if (this.openTimerId !== null) {
      clearTimeout(this.openTimerId);
      this.openTimerId = null;
    }

    if (this.autoCloseTimerId !== null) {
      clearTimeout(this.autoCloseTimerId);
      this.autoCloseTimerId = null;
    }

    if (this.closeTimerId !== null) {
      clearTimeout(this.closeTimerId);
      this.closeTimerId = null;
    }
  }
}
