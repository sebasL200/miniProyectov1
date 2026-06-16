import { Location } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductVariantFormService } from '@product-variants/components/forms/product-variant-form/product-variant-form.service';
import { ProductVariantFormData } from '@product-variants/components/forms/product-variant-form/types';
import { ProductVariantActionsService } from '@product-variants/services/product-variant-actions/product-variant-actions.service';
import { AttributeProductVariantSummary } from '@product-variants/types/attribute.type';
import { ProductService } from '@products/services/product/product.service';
import { ProductsQueryService } from '@products/services/products-query/products-query.service';
import { ProductSummary } from '@shared/models';
import { DialogService } from '@shared/services/dialog/dialog.service';
import { ToastService } from '@shared/services/toast/toast.service';
import { Subject, of, throwError } from 'rxjs';
import { Router } from '@angular/router';

import { RegisterProductVariantPage } from './register-product-variant.page';
import { ProductProductVariantSummary } from './types';

describe('RegisterProductVariantPage', () => {
  let component: RegisterProductVariantPage;
  let fixture: ComponentFixture<RegisterProductVariantPage>;
  let productVariantFormService: ProductVariantFormService;
  let productVariantActionsService: {
    createProductVariant: ReturnType<typeof vi.fn>;
  };
  let productService: { getProductById: ReturnType<typeof vi.fn> };
  let productsQueryService: { getProductsCursor: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };
  let location: { back: ReturnType<typeof vi.fn> };
  let dialogService: { openConfirm: ReturnType<typeof vi.fn> };
  let toastService: {
    showSuccess: ReturnType<typeof vi.fn>;
    showError: ReturnType<typeof vi.fn>;
  };

  const productSummary: ProductSummary = {
    id: 'product-1',
    name: 'Camisa',
    slug: 'camisa',
  };
  const directAttribute: AttributeProductVariantSummary = {
    id: 'attribute-color',
    name: 'Color',
    slug: 'color',
    isRequired: true,
  };
  const attribute: AttributeProductVariantSummary = {
    id: 'attribute-size',
    name: 'Talla',
    slug: 'talla',
    isRequired: false,
  };
  const selectedProduct: ProductProductVariantSummary = {
    ...productSummary,
    basePrice: 299,
    categories: [],
    descriptionHtml: '',
    isActive: true,
    isFeatured: false,
    modelYear: 2026,
    dimensionsBase: {
      width: '',
      height: '',
      length: '',
      weight: '',
    },
    directAttributes: [directAttribute],
    attributes: [attribute],
    variants: [],
    createdAt: null,
    updatedAt: null,
  };

  beforeEach(async () => {
    productService = {
      getProductById: vi.fn(() =>
        of({
          success: true,
          data: { product: selectedProduct },
        }),
      ),
    };
    productsQueryService = {
      getProductsCursor: vi.fn(() =>
        of({
          success: true,
          data: {
            products: [selectedProduct],
            nextCursor: null,
            prevCursor: null,
          },
        }),
      ),
    };
    productVariantActionsService = {
      createProductVariant: vi.fn(() =>
        of({
          success: true,
          data: {
            variant: {
              id: 'variant-1',
              product: productSummary,
              sku: 'SKU-12345',
              stockQuantity: 0,
              minimumStock: 0,
              dimensions: {},
              isActive: true,
              imageUrls: [],
              directAttributes: [],
              attributes: [],
              attributeValues: [],
              createdAt: null,
              updatedAt: null,
            },
          },
        }),
      ),
    };
    router = {
      navigate: vi.fn(),
    };
    location = {
      back: vi.fn(),
    };
    dialogService = {
      openConfirm: vi.fn(() => ({
        onAfterClose$: of(true),
      })),
    };
    toastService = {
      showSuccess: vi.fn(),
      showError: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [RegisterProductVariantPage],
      providers: [
        { provide: Router, useValue: router },
        { provide: Location, useValue: location },
        { provide: DialogService, useValue: dialogService },
        { provide: ToastService, useValue: toastService },
      ],
    })
      .overrideComponent(RegisterProductVariantPage, {
        set: {
          providers: [
            ProductVariantFormService,
            {
              provide: ProductVariantActionsService,
              useValue: productVariantActionsService,
            },
            { provide: ProductService, useValue: productService },
            { provide: ProductsQueryService, useValue: productsQueryService },
          ],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(RegisterProductVariantPage);
    component = fixture.componentInstance;
    productVariantFormService = fixture.debugElement.injector.get(
      ProductVariantFormService,
    );
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the selected product details and fills attribute options from the page', () => {
    productVariantFormService.selectedProductChange$.next(productSummary);

    expect(productService.getProductById).toHaveBeenCalledWith('product-1');
    expect(component.attributesOptions()).toEqual([
      {
        label: 'Talla',
        value: attribute,
      },
    ]);
    expect(component.directAttributes()).toEqual([directAttribute]);
  });

  it('creates the product variant from the form data', () => {
    const formData: ProductVariantFormData = {
      product: productSummary,
      name: 'Camisa Negra',
      sku: ' SKU-12345 ',
      price: 299,
      minimumStock: '2',
      barcode: '00012345600012',
      description: '<p>Variante negra</p>',
      isActive: true,
      images: [],
      dimensions: {
        width: '',
        height: '20 cm',
        length: '30 cm',
        weight: '0.24 kg',
      },
      attributes: [directAttribute],
      attributeValues: [
        {
          attribute: directAttribute,
          value: ' Black ',
        },
      ],
    };

    component.onSubmit({
      data: formData,
      changes: formData,
      hasChanges: true,
    });

    expect(
      productVariantActionsService.createProductVariant,
    ).toHaveBeenCalledWith({
      productId: 'product-1',
      sku: 'SKU-12345',
      price: '299',
      minimumStock: 2,
      barcodeGtin: '00012345600012',
      descriptionHtml: '<p>Variante negra</p>',
      dimensions: {
        weight: '0.24 kg',
        height: '20 cm',
        length: '30 cm',
      },
      isActive: true,
      imageUrls: [],
      attributeValues: [
        {
          attributeId: 'attribute-color',
          value: 'Black',
        },
      ],
    });
    expect(toastService.showSuccess).toHaveBeenCalledWith(
      'Variante creada correctamente.',
    );
    expect(router.navigate).toHaveBeenCalledWith(
      ['catalogs', 'product-variants'],
      { queryParams: { productId: 'product-1' } },
    );
    expect(dialogService.openConfirm).not.toHaveBeenCalled();
  });

  it('confirms before creating when the base price is less than or equal to the warning pricing', () => {
    const formData = productVariantFormData({ price: 1 });

    component.onSubmit({
      data: formData,
      changes: formData,
      hasChanges: true,
    });

    expect(dialogService.openConfirm).toHaveBeenCalledWith(
      {
        message: 'El precio base es menor o igual a $10. ¿Deseas continuar?',
        confirmVariant: 'primary',
      },
      {
        title: 'Advertencia de precio',
      },
    );
    expect(
      productVariantActionsService.createProductVariant,
    ).toHaveBeenCalled();
  });

  it('does not create the product variant when the warning pricing confirmation is canceled', () => {
    const onAfterClose$ = new Subject<boolean | undefined>();
    dialogService.openConfirm.mockReturnValue({ onAfterClose$ });
    const formData = productVariantFormData({ price: 1 });

    component.onSubmit({
      data: formData,
      changes: formData,
      hasChanges: true,
    });
    onAfterClose$.next(false);

    expect(
      productVariantActionsService.createProductVariant,
    ).not.toHaveBeenCalled();
  });

  it('shows duplicate attribute combination errors in Spanish', () => {
    productVariantActionsService.createProductVariant.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'duplicate variant attribute combination',
        },
      })),
    );
    const formData = productVariantFormData();

    component.onSubmit({
      data: formData,
      changes: formData,
      hasChanges: true,
    });

    expect(toastService.showError).toHaveBeenCalledWith(
      'Ya existe una variante con la misma combinación de atributos y valores.',
    );
  });

  it('goes back without confirmation when canceling without changes', () => {
    const formData = productVariantFormData();

    component.onCanceled({
      data: formData,
      changes: {},
      hasChanges: false,
    });

    expect(location.back).toHaveBeenCalled();
    expect(dialogService.openConfirm).not.toHaveBeenCalled();
  });

  it('confirms before going back when canceling with changes', () => {
    const formData = productVariantFormData();

    component.onCanceled({
      data: formData,
      changes: { name: formData.name },
      hasChanges: true,
    });

    expect(dialogService.openConfirm).toHaveBeenCalledWith(
      {
        message: '¿Estás seguro de que quieres cancelar los cambios?',
        confirmText: 'Sí, cancelar',
        confirmVariant: 'danger',
        cancelText: 'No, seguir editando',
      },
      {
        title: 'Confirmar cancelación',
      },
    );
    expect(location.back).toHaveBeenCalled();
  });

  it('does not go back when cancel changes confirmation is rejected', () => {
    const onAfterClose$ = new Subject<boolean | undefined>();
    dialogService.openConfirm.mockReturnValue({ onAfterClose$ });
    const formData = productVariantFormData();

    component.onCanceled({
      data: formData,
      changes: { name: formData.name },
      hasChanges: true,
    });
    onAfterClose$.next(false);

    expect(location.back).not.toHaveBeenCalled();
  });
});

function productVariantFormData(
  overrides: Partial<ProductVariantFormData> = {},
): ProductVariantFormData {
  const product: ProductSummary = {
    id: 'product-1',
    name: 'Camisa',
    slug: 'camisa',
  };
  const directAttribute: AttributeProductVariantSummary = {
    id: 'attribute-color',
    name: 'Color',
    slug: 'color',
    isRequired: true,
  };

  return {
    product,
    name: 'Camisa Negra',
    sku: ' SKU-12345 ',
    price: 299,
    minimumStock: '2',
    barcode: '00012345600012',
    description: '<p>Variante negra</p>',
    isActive: true,
    images: [],
    dimensions: {
      width: '',
      height: '20 cm',
      length: '30 cm',
      weight: '0.24 kg',
    },
    attributes: [directAttribute],
    attributeValues: [
      {
        attribute: directAttribute,
        value: ' Black ',
      },
    ],
    ...overrides,
  };
}
