import {
  Component,
  WritableSignal,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ProductVariantService } from '@product-variants/services/product-variant/product-variant.service';
import {
  Badge,
  Button,
  HtmlViewer,
  InputText,
  Label,
  PageLayout,
} from '@shared/components';
import { IDialogComponent } from '@shared/components/ui/dialog/interfaces/dialog-component.interface';
import { DialogRef } from '@shared/components/ui/dialog/models/dialog-ref.model';
import { FormDivider } from '@shared/components/ui/form-divider/form-divider';
import { ProductVariant } from '@shared/models';
import { ToastService } from '@shared/services/toast/toast.service';

@Component({
  selector: 'ecom-product-variant-details.dialog',
  imports: [Badge, Button, FormDivider, HtmlViewer, InputText, Label, PageLayout],
  templateUrl: './product-variant-details.dialog.html',
  styleUrl: './product-variant-details.dialog.css',
  providers: [ProductVariantService],
})
export class ProductVariantDetailsDialog implements IDialogComponent<string, void> {
  private readonly productVariantService = inject(ProductVariantService);
  private readonly toastService = inject(ToastService);

  readonly id = signal<string | null>(null);
  readonly dialogRef: WritableSignal<DialogRef<string, void> | null> =
    signal(null);
  readonly variant = signal<ProductVariant | null>(null);
  readonly activeLabel = computed(() =>
    this.variant()?.isActive ? 'Activa' : 'Inactiva',
  );
  readonly isLoading = computed(
    () => this.id() !== null && this.variant() === null,
  );
  readonly priceLabel = computed(() => this.currencyLabel(this.variant()?.price));

  constructor() {
    effect(() => {
      const id = this.id();
      if (id !== null) {
        this.loadProductVariantDetails(id);
      }
    });
  }

  setDialogRef(ref: DialogRef<string, void>): void {
    this.dialogRef.set(ref);
    this.id.set(ref.data);
  }

  closeDialog(): void {
    this.dialogRef()?.close();
  }

  private loadProductVariantDetails(id: string): void {
    this.variant.set(null);
    this.productVariantService.getProductVariantById(id).subscribe({
      next: ({ data }) => {
        this.variant.set(data.variant);
      },
      error: () => {
        this.closeDialog();
        this.toastService.showError(
          'Error al cargar los detalles de la variante.',
        );
      },
    });
  }

  private currencyLabel(value: number | undefined): string {
    if (value === undefined) {
      return 'Sin precio';
    }

    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(value);
  }
}
