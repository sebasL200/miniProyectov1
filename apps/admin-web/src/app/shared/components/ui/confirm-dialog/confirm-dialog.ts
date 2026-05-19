import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { Button } from '../button/button';
import { IDialogComponent } from '../dialog/interfaces/dialog-component.interface';
import { DialogRef } from '../dialog/models/dialog-ref.model';
import { ConfirmDialogData } from './confirm-dialog.types';

@Component({
  selector: 'ecom-confirm-dialog',
  imports: [Button],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block space-y-6',
  },
})
export class ConfirmDialog implements IDialogComponent<ConfirmDialogData | undefined, boolean> {
  private ref!: DialogRef<ConfirmDialogData | undefined, boolean>;
  protected data = signal<ConfirmDialogData | undefined>(undefined);

  readonly cancelText = computed(() => this.data()?.cancelText ?? 'Cancelar');
  readonly cancelVariant = computed(() => this.data()?.cancelVariant ?? 'ghost');
  readonly confirmText = computed(() => this.data()?.confirmText ?? 'Confirmar');
  readonly confirmVariant = computed(() => this.data()?.confirmVariant ?? 'primary');
  readonly message = computed(() => this.data()?.message ?? '¿Estás seguro?');

  setDialogRef(ref: DialogRef<ConfirmDialogData | undefined, boolean>): void {
    this.ref = ref;
    this.data.set(ref.data);
  }

  close(result?: boolean): void {
    void this.ref.close(result);
  }
}
