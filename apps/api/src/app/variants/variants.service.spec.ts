jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationService } from '../common/pagination/pagination.service';
import { VariantsService } from './variants.service';

describe('VariantsService', () => {
  const id = '018f4dc4-5f51-7c55-9b8f-15fbdd99b601';
  const productId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b501';
  const brandId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b401';
  const inheritedAttributeId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b301';
  const extraAttributeId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b302';
  const row = {
    id,
    product: {
      id: productId,
      name: 'Product',
      slug: 'product',
      brand: {
        id: brandId,
        name: 'Brand',
        slug: 'brand',
      },
      categories: [
        {
          categoryId: '018f4dc4-5f51-7c55-9b8f-15fbdd99b102',
          category: {
            id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b102',
            name: 'Category',
            slug: 'category',
            attributes: [
              {
                attribute: {
                  id: inheritedAttributeId,
                  name: 'Color',
                  slug: 'color',
                },
              },
            ],
          },
        },
      ],
      attributeLinks: [],
    },
    sku: 'SKU-12345',
    price: new Prisma.Decimal(10.5),
    stockQuantity: 5,
    minimumStock: 1,
    barcodeGtin: '00012345600012',
    descriptionHtml: '<p>Description</p>',
    offerPrice: new Prisma.Decimal(9.99),
    offerStart: new Date('2026-04-20T00:00:00.000Z'),
    offerEnd: new Date('2026-04-21T00:00:00.000Z'),
    dimensions: { weight: '0.24 kg' },
    isActive: true,
    imageUrls: [],
    attributeLinks: [
      {
        attribute: {
          id: extraAttributeId,
          name: 'Size',
          slug: 'size',
        },
      },
    ],
    createdAt: new Date('2026-04-13T00:00:00.000Z'),
    updatedAt: new Date('2026-04-13T00:00:00.000Z'),
    attributeValues: [
      {
        attributeId: inheritedAttributeId,
        value: 'Black',
        attribute: {
          id: inheritedAttributeId,
          name: 'Color',
          slug: 'color',
        },
      },
      {
        attributeId: extraAttributeId,
        value: '8',
        attribute: {
          id: extraAttributeId,
          name: 'Size',
          slug: 'size',
        },
      },
    ],
  };

  let product: {
    findFirst: jest.Mock;
  };
  let attribute: {
    findMany: jest.Mock;
  };
  let variant: {
    create: jest.Mock;
    count: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
  };
  let variantAttributeValue: {
    createMany: jest.Mock;
    deleteMany: jest.Mock;
  };
  let variantAttribute: {
    createMany: jest.Mock;
    deleteMany: jest.Mock;
  };
  let service: VariantsService;

  beforeEach(() => {
    product = {
      findFirst: jest.fn(),
    };
    attribute = {
      findMany: jest.fn(),
    };
    variant = {
      create: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    };
    variantAttributeValue = {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    };
    variantAttribute = {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    };
    service = new VariantsService(
      {
        client: {
          product,
          attribute,
          variant,
          variantAttribute,
          variantAttributeValue,
          $transaction: jest.fn(async (callback) =>
            callback({
              variant,
              variantAttribute,
              variantAttributeValue,
            }),
          ),
        },
      } as never,
      new PaginationService(),
    );
  });

  it('creates a variant with inherited and variant-owned string attributes', async () => {
    product.findFirst.mockResolvedValue({
      ...row.product,
    });
    attribute.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: extraAttributeId, name: 'Size', slug: 'size' },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: extraAttributeId, name: 'Size', slug: 'size' },
      ])
      .mockResolvedValueOnce([
        { id: inheritedAttributeId, name: 'Color', slug: 'color' },
        { id: extraAttributeId, name: 'Size', slug: 'size' },
      ]);
    variant.findFirst.mockResolvedValueOnce(null);
    variant.findMany.mockResolvedValueOnce([]);
    variant.create.mockResolvedValue(row);

    await expect(
      service.createVariant({
        productId,
        sku: 'SKU-12345',
        price: '10.50',
        minimumStock: 1,
        barcodeGtin: '00012345600012',
        descriptionHtml: '<p>Description</p>',
        dimensions: { weight: '0.24 kg' },
        isActive: true,
        imageUrls: [],
        attributeIds: [extraAttributeId],
        attributeValues: [
          { attributeId: inheritedAttributeId, value: 'Black' },
          { attributeId: extraAttributeId, value: '8' },
        ],
      }),
    ).resolves.toEqual({
      variant: {
        id,
        product: {
          id: productId,
          name: 'Product',
          slug: 'product',
          brand: {
            id: brandId,
            name: 'Brand',
            slug: 'brand',
          },
        },
        sku: 'SKU-12345',
        price: '10.5',
        stockQuantity: 5,
        minimumStock: 1,
        barcodeGtin: '00012345600012',
        descriptionHtml: '<p>Description</p>',
        offerPrice: '9.99',
        offerStart: row.offerStart,
        offerEnd: row.offerEnd,
        dimensions: { weight: '0.24 kg' },
        isActive: true,
        imageUrls: [],
        directAttributes: [
          {
            id: extraAttributeId,
            name: 'Size',
            slug: 'size',
          },
        ],
        attributes: [
          {
            id: inheritedAttributeId,
            name: 'Color',
            slug: 'color',
          },
          {
            id: extraAttributeId,
            name: 'Size',
            slug: 'size',
          },
        ],
        attributeValues: [
          {
            attribute: {
              id: inheritedAttributeId,
              name: 'Color',
              slug: 'color',
            },
            value: 'Black',
          },
          {
            attribute: {
              id: extraAttributeId,
              name: 'Size',
              slug: 'size',
            },
            value: '8',
          },
        ],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      },
    });
  });

  it('rejects variants missing inherited attribute values', async () => {
    product.findFirst.mockResolvedValue({
      ...row.product,
      categories: [
        {
          ...row.product.categories[0],
          category: {
            ...row.product.categories[0].category,
            attributes: [
              {
                attribute: {
                  id: inheritedAttributeId,
                  name: 'Color',
                  slug: 'color',
                  isRequired: true,
                },
              },
            ],
          },
        },
      ],
    });
    attribute.findMany.mockResolvedValueOnce([]);

    await expect(
      service.createVariant({
        productId,
        sku: 'SKU-12345',
        isActive: true,
        imageUrls: [],
        attributeValues: [],
      }),
    ).rejects.toEqual(
      new BadRequestException(
        'validation error: variants must provide string values for all effective variant attributes',
      ),
    );
  });

  it('rejects variants missing optional inherited attribute values', async () => {
    product.findFirst.mockResolvedValue({
      ...row.product,
    });
    attribute.findMany.mockResolvedValueOnce([]);

    await expect(
      service.createVariant({
        productId,
        sku: 'SKU-12345',
        isActive: true,
        imageUrls: [],
        attributeValues: [],
      }),
    ).rejects.toEqual(
      new BadRequestException(
        'validation error: variants must provide string values for all effective variant attributes',
      ),
    );
  });

  it('rejects numeric variant weight dimensions', async () => {
    product.findFirst.mockResolvedValue({
      ...row.product,
    });
    attribute.findMany.mockResolvedValueOnce([]);

    await expect(
      service.createVariant({
        productId,
        sku: 'SKU-12345',
        isActive: true,
        imageUrls: [],
        dimensions: { weight: 0.24 } as never,
        attributeValues: [],
      }),
    ).rejects.toEqual(
      new BadRequestException(
        'validation error: dimensions.weight must be a string',
      ),
    );
  });

  it('rejects variant weightUnit dimensions', async () => {
    product.findFirst.mockResolvedValue({
      ...row.product,
    });
    attribute.findMany.mockResolvedValueOnce([]);

    await expect(
      service.createVariant({
        productId,
        sku: 'SKU-12345',
        isActive: true,
        imageUrls: [],
        dimensions: { weight: '0.24 kg', weightUnit: 'kg' } as never,
        attributeValues: [],
      }),
    ).rejects.toEqual(
      new BadRequestException(
        'validation error: dimensions.weightUnit is not supported; include the unit in dimensions.weight',
      ),
    );
  });

  it('returns offset pagination with the new attribute value shape', async () => {
    variant.findMany.mockResolvedValue([row]);
    variant.count.mockResolvedValue(1);

    await expect(
      service.listVariantsByProduct(productId, {
        paginationType: 'offset',
        pageSize: 10,
        page: 1,
        isActive: true,
      }),
    ).resolves.toEqual({
      variants: [
        expect.objectContaining({
          id,
          directAttributes: [
            {
              id: extraAttributeId,
              name: 'Size',
              slug: 'size',
            },
          ],
          attributes: [
            {
              id: inheritedAttributeId,
              name: 'Color',
              slug: 'color',
            },
            {
              id: extraAttributeId,
              name: 'Size',
              slug: 'size',
            },
          ],
          attributeValues: [
            {
              attribute: {
                id: inheritedAttributeId,
                name: 'Color',
                slug: 'color',
              },
              value: 'Black',
            },
            {
              attribute: {
                id: extraAttributeId,
                name: 'Size',
                slug: 'size',
              },
              value: '8',
            },
          ],
        }),
      ],
      pagination: {
        offset: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
        },
      },
    });

    expect(variant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          deletedAt: null,
          productId,
          isActive: true,
        },
      }),
    );
    expect(variant.count).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        productId,
        isActive: true,
      },
    });
  });

  it('returns offset pagination for all variants without a product filter', async () => {
    variant.findMany.mockResolvedValue([row]);
    variant.count.mockResolvedValue(1);

    await expect(
      service.listVariants({
        paginationType: 'offset',
        pageSize: 10,
        page: 1,
        isActive: false,
      }),
    ).resolves.toEqual({
      variants: [
        expect.objectContaining({
          id,
          product: {
            id: productId,
            name: 'Product',
            slug: 'product',
            brand: {
              id: brandId,
              name: 'Brand',
              slug: 'brand',
            },
          },
        }),
      ],
      pagination: {
        offset: {
          currentPage: 1,
          totalPages: 1,
          totalCount: 1,
        },
      },
    });

    expect(variant.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { deletedAt: null, isActive: false },
      }),
    );
    expect(variant.count).toHaveBeenCalledWith({
      where: { deletedAt: null, isActive: false },
    });
  });

  it('maps invalid variant ids to not found', async () => {
    await expect(service.getVariant('bad-id')).rejects.toEqual(
      new NotFoundException('variant not found'),
    );
  });

  it('rejects duplicate attribute combinations based on attribute/value pairs', async () => {
    product.findFirst.mockResolvedValue({
      ...row.product,
    });
    attribute.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: extraAttributeId, name: 'Size', slug: 'size' },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        { id: extraAttributeId, name: 'Size', slug: 'size' },
      ])
      .mockResolvedValueOnce([
        { id: inheritedAttributeId, name: 'Color', slug: 'color' },
        { id: extraAttributeId, name: 'Size', slug: 'size' },
      ]);
    variant.findFirst.mockResolvedValueOnce(null);
    variant.findMany.mockResolvedValueOnce([
      {
        id: 'other',
        attributeValues: [
          { attributeId: inheritedAttributeId, value: 'Black' },
          { attributeId: extraAttributeId, value: 'M' },
        ],
      },
    ]);

    await expect(
      service.createVariant({
        productId,
        sku: 'SKU-12345',
        isActive: true,
        imageUrls: [],
        attributeIds: [extraAttributeId],
        attributeValues: [
          { attributeId: inheritedAttributeId, value: 'Black' },
          { attributeId: extraAttributeId, value: 'M' },
        ],
      }),
    ).rejects.toEqual(
      new ConflictException('duplicate variant attribute combination'),
    );
  });
});

