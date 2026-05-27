jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

describe('ProductsController', () => {
  const categoryId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b102';
  let controller: ProductsController;
  let productsService: {
    listProducts: jest.Mock;
    getProduct: jest.Mock;
    getProductBySlug: jest.Mock;
    listProductsByCategory: jest.Mock;
    createProduct: jest.Mock;
    createBatchProducts: jest.Mock;
    updateProduct: jest.Mock;
    toggleStatus: jest.Mock;
    toggleFeatured: jest.Mock;
    deleteProduct: jest.Mock;
  };

  const product = {
    id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b101',
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
    categories: [
      {
        id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b102',
        name: 'Category',
        slug: 'category',
      },
    ],
    directAttributes: [
      {
        id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b301',
        name: 'Material',
        slug: 'material',
      },
    ],
    attributes: [
      {
        id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b301',
        name: 'Material',
        slug: 'material',
      },
    ],
    createdAt: new Date('2026-04-13T00:00:00.000Z'),
    updatedAt: new Date('2026-04-13T00:00:00.000Z'),
    variants: [{ id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b103', sku: 'SKU-1' }],
    brand: {
      id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b104',
      name: 'Brand',
      slug: 'brand',
    },
  };

  beforeEach(async () => {
    productsService = {
      listProducts: jest.fn(),
      getProduct: jest.fn(),
      getProductBySlug: jest.fn(),
      listProductsByCategory: jest.fn(),
      createProduct: jest.fn(),
      createBatchProducts: jest.fn(),
      updateProduct: jest.fn(),
      toggleStatus: jest.fn(),
      toggleFeatured: jest.fn(),
      deleteProduct: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [{ provide: ProductsService, useValue: productsService }],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('returns the product detail envelope', async () => {
    productsService.getProduct.mockResolvedValue({ product });

    const result = await controller.getProduct({ id: product.id });

    expect(productsService.getProduct).toHaveBeenCalledWith(product.id);
    expect(result).toEqual({
      success: true,
      message: 'Product retrieved successfully',
      data: { product },
    });
  });

  it('returns the list snapshot envelope with flat offset metadata', async () => {
    productsService.listProducts.mockResolvedValue({
      products: [product],
      totalPages: 1,
      totalCount: 1,
    });

    const result = await controller.listProducts({
      paginationType: 'offset',
      pageSize: '10',
      page: '1',
    } as never);

    expect(result).toEqual({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products: [product],
        totalPages: 1,
        totalCount: 1,
      },
    });
  });

  it('returns the category list snapshot envelope with flat cursor metadata', async () => {
    productsService.listProductsByCategory.mockResolvedValue({
      products: [product],
      nextCursor: 'next-cursor-token',
      prevCursor: 'prev-cursor-token',
    });

    const result = await controller.listProductsByCategory({ categoryId }, {
      paginationType: 'cursor',
      pageSize: '10',
      after: 'anchor-cursor-token',
    } as never);

    expect(productsService.listProductsByCategory).toHaveBeenCalledWith(
      categoryId,
      {
        paginationType: 'cursor',
        pageSize: 10,
        page: undefined,
        after: 'anchor-cursor-token',
        before: undefined,
      },
    );
    expect(result).toEqual({
      success: true,
      message: 'Products retrieved successfully',
      data: {
        products: [product],
        nextCursor: 'next-cursor-token',
        prevCursor: 'prev-cursor-token',
      },
    });
  });

  it('returns the create snapshot envelope', async () => {
    productsService.createProduct.mockResolvedValue({ product });

    const result = await controller.createProduct({
      name: 'Product',
      modelYear: '2026',
      descriptionHtml: '<p>Description</p>',
      descriptionShort: 'Short',
      specificationsHtml: '<p>Specs</p>',
      basePrice: 10.5,
      isActive: true,
      isFeatured: false,
      dimensionsBase: { weight: '1 kg' },
      categoriesId: ['018f4dc4-5f51-7c55-9b8f-15fbdd99b102'],
      attributeIds: ['018f4dc4-5f51-7c55-9b8f-15fbdd99b301'],
      brandId: product.brand.id,
    });

    expect(result).toEqual({
      success: true,
      message: 'Product created successfully',
      data: { product },
    });
  });

  it('returns the batch create status envelope', async () => {
    productsService.createBatchProducts.mockResolvedValue({
      status: 'partial',
      succeeded: [{ key: 'tmp-1', id: product.id }],
      failed: [{ key: 'tmp-2', reason: 'product slug already exists' }],
    });

    const result = await controller.createBatchProducts({
      products: [
        {
          key: 'tmp-1',
          name: 'Product',
          modelYear: '2026',
          descriptionHtml: '<p>Description</p>',
          descriptionShort: 'Short',
          basePrice: 10.5,
          isActive: true,
          isFeatured: false,
          categoriesId: [categoryId],
        },
      ],
    });

    expect(productsService.createBatchProducts).toHaveBeenCalledWith({
      products: [
        expect.objectContaining({
          key: 'tmp-1',
          name: 'Product',
          categoriesId: [categoryId],
        }),
      ],
    });
    expect(result).toEqual({
      success: true,
      message: 'Batch products created successfully',
      data: {
        status: 'partial',
        succeeded: [{ key: 'tmp-1', id: product.id }],
        failed: [{ key: 'tmp-2', reason: 'product slug already exists' }],
      },
    });
  });

  it('returns delete payload with empty categories and attributes', async () => {
    productsService.deleteProduct.mockResolvedValue({
      product: {
        ...product,
        categories: [],
        directAttributes: [],
        attributes: [],
        variants: [],
      },
    });

    const result = await controller.deleteProduct({ id: product.id });

    expect(result).toEqual({
      success: true,
      message: 'Product deleted successfully',
      data: {
        product: {
          ...product,
          categories: [],
          directAttributes: [],
          attributes: [],
          variants: [],
        },
      },
    });
  });

  it('normalizes cursor pagination type casing', async () => {
    productsService.listProducts.mockResolvedValue({
      products: [product],
      nextCursor: 'next-cursor-token',
    });

    await controller.listProducts({
      paginationType: 'Cursor',
      pageSize: '10',
    } as never);

    expect(productsService.listProducts).toHaveBeenCalledWith({
      paginationType: 'cursor',
      pageSize: 10,
      page: undefined,
      after: undefined,
      before: undefined,
    });
  });
});
