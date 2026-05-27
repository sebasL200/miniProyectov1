jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PaginationService } from '../common/pagination/pagination.service';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  const id = '018f4dc4-5f51-7c55-9b8f-15fbdd99b101';
  const categoryId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b102';
  const brandId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b104';
  const attributeId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b301';
  const globalAttributeId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b302';
  const row = {
    id,
    brand: {
      id: brandId,
      name: 'Brand',
      slug: 'brand',
    },
    name: 'Product',
    slug: 'product',
    specificationsHtml: '<p>Specs</p>',
    shortDescription: 'Short',
    descriptionHtml: '<p>Description</p>',
    isActive: true,
    basePrice: new Prisma.Decimal(10.5),
    skuBase: '2026',
    isFeatured: false,
    dimensionsWeight: { weight: '1 kg' },
    createdAt: new Date('2026-04-13T00:00:00.000Z'),
    updatedAt: new Date('2026-04-13T00:00:00.000Z'),
    categories: [
      {
        categoryId,
        category: {
          id: categoryId,
          name: 'Category',
          slug: 'category',
          attributes: [
            {
              attribute: {
                id: globalAttributeId,
                name: 'Color',
                slug: 'color',
              },
            },
          ],
        },
      },
    ],
    variants: [{ id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b103', sku: 'SKU-1' }],
    attributeLinks: [
      {
        attribute: {
          id: attributeId,
          name: 'Material',
          slug: 'material',
        },
      },
    ],
  };
  const nextRow = {
    ...row,
    id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b105',
    name: 'Product Plus',
    slug: 'product-plus',
    variants: [{ id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b106' }],
  };

  let product: {
    create: jest.Mock;
    count: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    findUniqueOrThrow: jest.Mock;
  };
  let productCategory: {
    createMany: jest.Mock;
    deleteMany: jest.Mock;
  };
  let productAttribute: {
    createMany: jest.Mock;
    deleteMany: jest.Mock;
  };
  let attribute: {
    findMany: jest.Mock;
  };
  let variant: {
    findMany: jest.Mock;
  };
  let pagination: PaginationService;
  let service: ProductsService;

  beforeEach(() => {
    product = {
      create: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      findUniqueOrThrow: jest.fn(),
    };
    productCategory = {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    };
    productAttribute = {
      createMany: jest.fn(),
      deleteMany: jest.fn(),
    };
    attribute = {
      findMany: jest.fn().mockResolvedValue([]),
    };
    variant = {
      findMany: jest.fn(),
    };
    pagination = new PaginationService();
    service = new ProductsService(
      {
        client: {
          product,
          productCategory,
          productAttribute,
          attribute,
          variant,
          $transaction: jest.fn(async (callback) =>
            callback({
              product,
              productCategory,
              productAttribute,
            }),
          ),
        },
      } as never,
      pagination,
    );
  });

  it('creates a product and returns inherited plus direct attributes', async () => {
    product.findFirst.mockResolvedValueOnce(null);
    attribute.findMany
      .mockResolvedValueOnce([
        { id: attributeId, name: 'Material', slug: 'material' },
      ])
      .mockResolvedValueOnce([
        { id: globalAttributeId, name: 'Color', slug: 'color' },
      ]);
    product.create.mockResolvedValue(row);

    await expect(
      service.createProduct({
        name: 'Product',
        modelYear: '2026',
        descriptionHtml: '<p>Description</p>',
        descriptionShort: 'Short',
        specificationsHtml: '<p>Specs</p>',
        basePrice: 10.5,
        isActive: true,
        isFeatured: false,
        dimensionsBase: { weight: '1 kg' },
        categoriesId: [categoryId],
        attributeIds: [attributeId],
        brandId,
      }),
    ).resolves.toEqual({
      product: {
        id,
        name: 'Product',
        slug: 'product',
        modelYear: '2026',
        descriptionHtml: '<p>Description</p>',
        descriptionShort: 'Short',
        specificationsHtml: '<p>Specs</p>',
        basePrice: 10.5,
        isActive: true,
        isFeatured: false,
        dimensionsBase: { weight: '1 kg' },
        categories: [{ id: categoryId, name: 'Category', slug: 'category' }],
        directAttributes: [
          { id: attributeId, name: 'Material', slug: 'material' },
        ],
        attributes: [
          { id: globalAttributeId, name: 'Color', slug: 'color' },
          { id: attributeId, name: 'Material', slug: 'material' },
        ],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        variants: [
          { id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b103', sku: 'SKU-1' },
        ],
        brand: { id: brandId, name: 'Brand', slug: 'brand' },
      },
    });
  });

  it('rejects numeric product weight dimensions', async () => {
    await expect(
      service.createProduct({
        name: 'Product',
        modelYear: '2026',
        descriptionHtml: '<p>Description</p>',
        basePrice: 10.5,
        isActive: true,
        isFeatured: false,
        dimensionsBase: { weight: 0.24 } as never,
        categoriesId: [categoryId],
      }),
    ).rejects.toEqual(
      new BadRequestException(
        'validation error: dimensionsBase.weight must be a string',
      ),
    );
  });

  it('rejects product weightUnit dimensions', async () => {
    await expect(
      service.createProduct({
        name: 'Product',
        modelYear: '2026',
        descriptionHtml: '<p>Description</p>',
        basePrice: 10.5,
        isActive: true,
        isFeatured: false,
        dimensionsBase: { weight: '0.24 kg', weightUnit: 'kg' } as never,
        categoriesId: [categoryId],
      }),
    ).rejects.toEqual(
      new BadRequestException(
        'validation error: dimensionsBase.weightUnit is not supported; include the unit in dimensionsBase.weight',
      ),
    );
  });

  it('creates products in batch and reports success status', async () => {
    jest
      .spyOn(service, 'createProduct')
      .mockResolvedValueOnce({ product: { id } } as never)
      .mockResolvedValueOnce({ product: { id: nextRow.id } } as never);

    await expect(
      service.createBatchProducts({
        products: [
          {
            key: 'tmp-1',
            name: 'Product',
            modelYear: '2026',
            descriptionHtml: '<p>Description</p>',
            basePrice: 10.5,
            isActive: true,
            isFeatured: false,
            categoriesId: [categoryId],
          },
          {
            key: 'tmp-2',
            name: 'Product Plus',
            modelYear: '2026',
            descriptionHtml: '<p>Description</p>',
            basePrice: 20,
            isActive: true,
            isFeatured: false,
            categoriesId: [categoryId],
          },
        ],
      }),
    ).resolves.toEqual({
      status: 'success',
      succeeded: [
        { key: 'tmp-1', id },
        { key: 'tmp-2', id: nextRow.id },
      ],
      failed: [],
    });
  });

  it('creates products in batch and reports partial failures', async () => {
    jest
      .spyOn(service, 'createProduct')
      .mockResolvedValueOnce({ product: { id } } as never)
      .mockRejectedValueOnce(new BadRequestException('invalid product'));

    await expect(
      service.createBatchProducts({
        products: [
          {
            key: 'tmp-1',
            name: 'Product',
            modelYear: '2026',
            descriptionHtml: '<p>Description</p>',
            basePrice: 10.5,
            isActive: true,
            isFeatured: false,
            categoriesId: [categoryId],
          },
          {
            key: 'tmp-2',
            name: 'Broken Product',
            modelYear: '2026',
            descriptionHtml: '<p>Description</p>',
            basePrice: 20,
            isActive: true,
            isFeatured: false,
            categoriesId: [categoryId],
          },
        ],
      }),
    ).resolves.toEqual({
      status: 'partial',
      succeeded: [{ key: 'tmp-1', id }],
      failed: [{ key: 'tmp-2', reason: 'invalid product' }],
    });
  });

  it('returns offset pagination with effective attributes', async () => {
    product.findMany.mockResolvedValue([row]);
    product.count.mockResolvedValue(1);
    attribute.findMany.mockResolvedValue([
      { id: globalAttributeId, name: 'Color', slug: 'color' },
    ]);

    await expect(
      service.listProducts({
        paginationType: 'offset',
        pageSize: 10,
        page: 1,
      }),
    ).resolves.toEqual({
      products: [
        expect.objectContaining({
          id,
          categories: [{ id: categoryId, name: 'Category', slug: 'category' }],
          attributes: [
            { id: globalAttributeId, name: 'Color', slug: 'color' },
            { id: attributeId, name: 'Material', slug: 'material' },
          ],
        }),
      ],
      totalPages: 1,
      totalCount: 1,
    });

    expect(product.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      include: expect.any(Object),
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 10,
      skip: 0,
    });
    expect(product.count).toHaveBeenCalledWith({ where: { deletedAt: null } });
  });

  it('returns flat offset pagination metadata for category lists', async () => {
    product.findMany.mockResolvedValue([row]);
    product.count.mockResolvedValue(1);

    await expect(
      service.listProductsByCategory(categoryId, {
        paginationType: 'offset',
        pageSize: 10,
        page: 1,
      }),
    ).resolves.toEqual({
      products: [
        expect.objectContaining({
          id,
          categories: [{ id: categoryId, name: 'Category', slug: 'category' }],
        }),
      ],
      totalPages: 1,
      totalCount: 1,
    });

    expect(product.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        categories: {
          some: {
            categoryId,
            category: {
              deletedAt: null,
            },
          },
        },
      },
      include: expect.any(Object),
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 10,
      skip: 0,
    });
    expect(product.count).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        categories: {
          some: {
            categoryId,
            category: {
              deletedAt: null,
            },
          },
        },
      },
    });
  });

  it('returns flat cursor pagination metadata for the general list', async () => {
    product.findMany.mockResolvedValue([row, nextRow]);

    await expect(
      service.listProducts({
        paginationType: 'cursor',
        pageSize: 1,
      }),
    ).resolves.toEqual({
      products: [
        expect.objectContaining({
          id,
          categories: [{ id: categoryId, name: 'Category', slug: 'category' }],
        }),
      ],
      nextCursor: expect.any(String),
    });

    expect(product.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null },
      include: expect.any(Object),
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 2,
    });
    expect(product.count).not.toHaveBeenCalled();
  });

  it('returns flat cursor pagination metadata for category lists', async () => {
    const after = pagination.encodeCursorToken({
      direction: 'after',
      keys: { name: row.name, id: row.id },
      filterHash: pagination.fingerprint({
        scope: 'products_by_category',
        categoryId,
      }),
    });

    product.findMany.mockResolvedValue([nextRow]);

    await expect(
      service.listProductsByCategory(categoryId, {
        paginationType: 'cursor',
        pageSize: 1,
        after,
      }),
    ).resolves.toEqual({
      products: [
        expect.objectContaining({
          id: nextRow.id,
          categories: [{ id: categoryId, name: 'Category', slug: 'category' }],
        }),
      ],
      prevCursor: expect.any(String),
    });

    expect(product.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          {
            deletedAt: null,
            categories: {
              some: {
                categoryId,
                category: {
                  deletedAt: null,
                },
              },
            },
          },
          {
            OR: [
              { name: { gt: row.name } },
              {
                name: row.name,
                id: { gt: row.id },
              },
            ],
          },
        ],
      },
      include: expect.any(Object),
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 2,
    });
    expect(product.count).not.toHaveBeenCalled();
  });

  it('maps invalid product ids to not found', async () => {
    await expect(service.getProduct('bad-id')).rejects.toEqual(
      new NotFoundException('products not found'),
    );
  });

  it('always includes isRequired in product attribute selects', async () => {
    product.findFirst.mockResolvedValue(row);

    await service.getProduct(id);

    expect(product.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          categories: expect.objectContaining({
            select: expect.objectContaining({
              category: expect.objectContaining({
                select: expect.objectContaining({
                  attributes: expect.objectContaining({
                    select: {
                      attribute: {
                        select: {
                          id: true,
                          name: true,
                          slug: true,
                          isRequired: true,
                        },
                      },
                    },
                  }),
                }),
              }),
            }),
          }),
          attributeLinks: expect.objectContaining({
            select: {
              attribute: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  isRequired: true,
                },
              },
            },
          }),
        }),
      }),
    );
  });

  it('rejects product attribute changes that would leave variants missing inherited values', async () => {
    product.findFirst.mockResolvedValue(row);
    attribute.findMany
      .mockResolvedValueOnce([
        { id: attributeId, name: 'Material', slug: 'material' },
      ])
      .mockResolvedValueOnce([
        { id: globalAttributeId, name: 'Color', slug: 'color' },
      ])
      .mockResolvedValueOnce([
        { id: globalAttributeId, name: 'Color', slug: 'color' },
      ])
      .mockResolvedValueOnce([
        { id: attributeId, name: 'Material', slug: 'material' },
      ]);
    variant.findMany.mockResolvedValue([
      {
        id: 'v1',
        sku: 'SKU-1',
        attributeValues: [{ attributeId: globalAttributeId }],
      },
    ]);

    await expect(
      service.updateProduct(id, {
        attributeIds: [attributeId],
      }),
    ).rejects.toEqual(
      new BadRequestException(
        'validation error: variant SKU-1 is missing values for the updated product attributes',
      ),
    );
  });

  it('rejects negative base prices with the legacy validation message', async () => {
    await expect(
      service.createProduct({
        name: 'Product',
        modelYear: '2026',
        descriptionHtml: '<p>Description</p>',
        basePrice: -1,
        isActive: true,
        isFeatured: false,
        categoriesId: [categoryId],
      }),
    ).rejects.toEqual(
      new BadRequestException(
        'validation error: base_price must be greater than 0',
      ),
    );
  });
});

