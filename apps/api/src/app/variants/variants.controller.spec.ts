jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { VariantsController } from './variants.controller';
import { VariantsService } from './variants.service';

describe('VariantsController', () => {
  let controller: VariantsController;
  let variantsService: {
    createVariant: jest.Mock;
    getVariant: jest.Mock;
    getVariantBySku: jest.Mock;
    listVariants: jest.Mock;
    listVariantsByProduct: jest.Mock;
    updateVariant: jest.Mock;
    toggleStatus: jest.Mock;
    deleteVariant: jest.Mock;
  };

  const variant = {
    id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b601',
    product: {
      id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b501',
      name: 'Product',
      slug: 'product',
    },
    sku: 'SKU-12345',
    price: '10.5',
    stockQuantity: 5,
    minimumStock: 1,
    barcodeGtin: '00012345600012',
    descriptionHtml: '<p>Description</p>',
    offerPrice: '9.99',
    offerStart: new Date('2026-04-20T00:00:00.000Z'),
    offerEnd: new Date('2026-04-21T00:00:00.000Z'),
    dimensions: { weight: '0.24 kg' },
    isActive: true,
    imageUrls: [],
    directAttributes: [
      {
        id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b302',
        name: 'Size',
        slug: 'size',
      },
    ],
    attributes: [
      {
        id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b301',
        name: 'Color',
        slug: 'color',
      },
      {
        id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b302',
        name: 'Size',
        slug: 'size',
      },
    ],
    attributeValues: [
      {
        attribute: {
          id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b301',
          name: 'Color',
          slug: 'color',
        },
        value: 'Black',
      },
    ],
    createdAt: new Date('2026-04-13T00:00:00.000Z'),
    updatedAt: new Date('2026-04-13T00:00:00.000Z'),
  };

  beforeEach(async () => {
    variantsService = {
      createVariant: jest.fn(),
      getVariant: jest.fn(),
      getVariantBySku: jest.fn(),
      listVariants: jest.fn(),
      listVariantsByProduct: jest.fn(),
      updateVariant: jest.fn(),
      toggleStatus: jest.fn(),
      deleteVariant: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VariantsController],
      providers: [{ provide: VariantsService, useValue: variantsService }],
    }).compile();

    controller = module.get<VariantsController>(VariantsController);
  });

  it('returns the create snapshot envelope', async () => {
    variantsService.createVariant.mockResolvedValue({ variant });

    const result = await controller.createVariant({
      productId: variant.product.id,
      sku: variant.sku,
      price: '10.50',
      minimumStock: 1,
      barcodeGtin: variant.barcodeGtin,
      descriptionHtml: variant.descriptionHtml,
      dimensions: { weight: '0.24 kg' },
      isActive: true,
      imageUrls: [],
      attributeIds: [variant.directAttributes[0].id],
      attributeValues: [
        {
          attributeId: variant.attributeValues[0].attribute.id,
          value: variant.attributeValues[0].value,
        },
      ],
    });

    expect(result).toEqual({
      success: true,
      message: 'Variant created successfully',
      data: { variant },
    });
  });

  it('returns the list variants envelope', async () => {
    variantsService.listVariants.mockResolvedValue({
      variants: [variant],
      pagination: {
        offset: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
        },
      },
    });

    const result = await controller.listVariants({
      paginationType: 'offset',
      pageSize: 10,
      page: 1,
      productId: variant.product.id,
      isActive: true,
    });

    expect(variantsService.listVariants).toHaveBeenCalledWith({
      paginationType: 'offset',
      pageSize: 10,
      page: 1,
      productId: variant.product.id,
      isActive: true,
      after: undefined,
      before: undefined,
    });
    expect(result).toEqual({
      success: true,
      message: 'Variants retrieved successfully',
      data: {
        variants: [variant],
        pagination: {
          offset: {
            currentPage: 1,
            totalPages: 1,
            totalCount: 1,
          },
        },
      },
    });
  });

  it('returns delete payload with empty attribute values', async () => {
    variantsService.deleteVariant.mockResolvedValue({
      variant: {
        ...variant,
        attributeValues: [],
      },
    });

    const result = await controller.deleteVariant({ id: variant.id });

    expect(result).toEqual({
      success: true,
      message: 'Variant deleted successfully',
      data: {
        variant: {
          ...variant,
          attributeValues: [],
        },
      },
    });
  });
});
