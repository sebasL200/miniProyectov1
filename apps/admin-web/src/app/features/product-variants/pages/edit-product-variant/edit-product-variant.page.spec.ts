import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductVariantActionsService } from '@product-variants/services/product-variant-actions/product-variant-actions.service';
import { ProductVariantService } from '@product-variants/services/product-variant/product-variant.service';
import { ProductVariant } from '@shared/models';
import { ToastService } from '@shared/services/toast/toast.service';
import { of, throwError } from 'rxjs';

import { EditProductVariantPage } from './edit-product-variant.page';

describe('EditProductVariantPage', () => {
  let component: EditProductVariantPage;
  let fixture: ComponentFixture<EditProductVariantPage>;
  let productVariantActionsService: {
    updateProductVariant: ReturnType<typeof vi.fn>;
  };
  let toastService: {
    showSuccess: ReturnType<typeof vi.fn>;
    showError: ReturnType<typeof vi.fn>;
  };

  const variant: ProductVariant = {
    id: 'variant-1',
    product: {
      id: 'product-1',
      name: 'Producto',
      slug: 'producto',
    },
    sku: 'SKU-12345',
    price: 199,
    stockQuantity: 5,
    minimumStock: 1,
    barcodeGtin: '96385074',
    descriptionHtml: '<p>Descripción</p>',
    offerPrice: 149,
    offerStart: new Date('2026-05-10T00:00:00.000Z'),
    offerEnd: new Date('2026-05-20T00:00:00.000Z'),
    dimensions: {
      weight: '0.24 kg',
    },
    isActive: true,
    imageUrls: [],
    directAttributes: [],
    attributes: [
      {
        id: 'attribute-color',
        name: 'Color',
        slug: 'color',
      },
    ],
    attributeValues: [
      {
        attribute: {
          id: 'attribute-color',
          name: 'Color',
          slug: 'color',
        },
        value: 'Negro',
      },
    ],
    createdAt: null,
    updatedAt: null,
  };

  beforeEach(async () => {
    toastService = {
      showSuccess: vi.fn(),
      showError: vi.fn(),
    };
    productVariantActionsService = {
      updateProductVariant: vi.fn(() =>
        of({
          success: true,
          data: { variant },
        }),
      ),
    };

    await TestBed.configureTestingModule({
      imports: [EditProductVariantPage],
      providers: [
        { provide: Location, useValue: { back: vi.fn() } },
        { provide: ToastService, useValue: toastService },
      ],
    })
      .overrideComponent(EditProductVariantPage, {
        set: {
          providers: [
            {
              provide: ProductVariantActionsService,
              useValue: productVariantActionsService,
            },
            {
              provide: ProductVariantService,
              useValue: {
                getProductVariantById: vi.fn(() =>
                  of({
                    success: true,
                    data: { variant },
                  }),
                ),
              },
            },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EditProductVariantPage);
    fixture.componentRef.setInput('id', 'variant-1');
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('updates the form initial data after saving the variant', () => {
    const updatedVariant: ProductVariant = {
      ...variant,
      sku: 'SKU-99999',
    };
    productVariantActionsService.updateProductVariant.mockReturnValue(
      of({
        success: true,
        data: { variant: updatedVariant },
      }),
    );

    component.onSubmit({
      data: {
        ...component.initialData()!,
        sku: 'SKU-99999',
      },
      changes: {
        name: 'Nombre no persistente',
        sku: 'SKU-99999',
        images: component.initialData().images,
        attributeValues: component.initialData().attributeValues,
      },
      hasChanges: true,
    });

    expect(productVariantActionsService.updateProductVariant).toHaveBeenCalledWith(
      'variant-1',
      {
        sku: 'SKU-99999',
      },
    );
    expect(component.initialData()).toEqual(
      expect.objectContaining({
        sku: 'SKU-99999',
      }),
    );
    expect(toastService.showSuccess).toHaveBeenCalledWith(
      'Variante actualizada correctamente.',
    );
  });

  it('does not update when only form-only fields changed', () => {
    productVariantActionsService.updateProductVariant.mockClear();

    component.onSubmit({
      data: {
        ...component.initialData()!,
        name: 'Nombre no persistente',
      },
      changes: {
        name: 'Nombre no persistente',
      },
      hasChanges: true,
    });

    expect(
      productVariantActionsService.updateProductVariant,
    ).not.toHaveBeenCalled();
  });

  it('shows duplicate attribute combination errors in Spanish', () => {
    productVariantActionsService.updateProductVariant.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'duplicate variant attribute combination',
        },
      })),
    );

    component.onSubmit({
      data: {
        ...component.initialData()!,
        sku: 'SKU-99999',
      },
      changes: {
        sku: 'SKU-99999',
      },
      hasChanges: true,
    });

    expect(toastService.showError).toHaveBeenCalledWith(
      'Ya existe una variante con la misma combinación de atributos y valores.',
    );
  });
});
