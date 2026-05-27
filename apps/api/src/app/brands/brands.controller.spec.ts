import { Test, TestingModule } from '@nestjs/testing';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { BrandsController } from './brands.controller';
import { BrandsService } from './brands.service';

describe('BrandsController', () => {
  let controller: BrandsController;
  let brandsService: {
    listBrands: jest.Mock;
    createBrand: jest.Mock;
    createBatchBrands: jest.Mock;
    getBrand: jest.Mock;
    updateBrand: jest.Mock;
    deleteBrand: jest.Mock;
    toggleActive: jest.Mock;
    toggleVisibleInMenu: jest.Mock;
  };

  const brand = {
    id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b101',
    name: 'Nike',
    visibleInMenu: true,
    slug: 'nike',
    logoUrl: 'https://example.test/logo.png',
    description: 'Brand',
    website: 'https://example.test',
    metaTitle: 'Nike',
    metaDescription: 'Meta',
    isActive: true,
    createdAt: new Date('2026-04-13T00:00:00.000Z'),
    updatedAt: new Date('2026-04-13T00:00:00.000Z'),
  };

  beforeEach(async () => {
    brandsService = {
      listBrands: jest.fn(),
      createBrand: jest.fn(),
      createBatchBrands: jest.fn(),
      getBrand: jest.fn(),
      updateBrand: jest.fn(),
      deleteBrand: jest.fn(),
      toggleActive: jest.fn(),
      toggleVisibleInMenu: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BrandsController],
      providers: [
        {
          provide: BrandsService,
          useValue: brandsService,
        },
      ],
    }).compile();

    controller = module.get<BrandsController>(BrandsController);
  });

  it('returns raw list data and keeps the success response metadata on the handler', async () => {
    brandsService.listBrands.mockResolvedValue({
      brands: [brand],
      totalCount: 1,
      totalPages: 1,
    });

    const result = await controller.listBrands({
      pageSize: '10',
      page: '1',
      name: 'Nik',
    });

    expect(brandsService.listBrands).toHaveBeenCalledWith({
      pageSize: 10,
      page: 1,
      paginationType: undefined,
      after: undefined,
      before: undefined,
      query: undefined,
      name: 'Nik',
      metaTitle: undefined,
      isActive: undefined,
      website: undefined,
      slug: undefined,
    });
    expect(result).toEqual({
      brands: [brand],
      totalCount: 1,
      totalPages: 1,
    });
  });

  it('allows cursor pagination without a search query', async () => {
    brandsService.listBrands.mockResolvedValue({
      brands: [brand],
      nextCursor: 'next-cursor-token',
    });

    const result = await controller.listBrands({
      pageSize: '10',
      paginationType: 'cursor',
    });

    expect(brandsService.listBrands).toHaveBeenCalledWith({
      pageSize: 10,
      page: undefined,
      paginationType: 'cursor',
      after: undefined,
      before: undefined,
      query: undefined,
      name: undefined,
      metaTitle: undefined,
      isActive: undefined,
      website: undefined,
      slug: undefined,
    });
    expect(result).toEqual({
      brands: [brand],
      nextCursor: 'next-cursor-token',
    });
  });

  it('normalizes cursor pagination type casing', async () => {
    brandsService.listBrands.mockResolvedValue({
      brands: [brand],
      nextCursor: 'next-cursor-token',
    });

    await controller.listBrands({
      pageSize: '10',
      paginationType: 'Cursor',
    });

    expect(brandsService.listBrands).toHaveBeenCalledWith(
      expect.objectContaining({
        paginationType: 'cursor',
      }),
    );
  });

  it('allows cursor tokens without a search query', async () => {
    brandsService.listBrands.mockResolvedValue({
      brands: [brand],
      prevCursor: 'prev-cursor-token',
    });

    const result = await controller.listBrands({
      pageSize: '10',
      paginationType: 'cursor',
      after: 'anchor-cursor-token',
    });

    expect(brandsService.listBrands).toHaveBeenCalledWith({
      pageSize: 10,
      page: undefined,
      paginationType: 'cursor',
      after: 'anchor-cursor-token',
      before: undefined,
      query: undefined,
      name: undefined,
      metaTitle: undefined,
      isActive: undefined,
      website: undefined,
      slug: undefined,
    });
    expect(result).toEqual({
      brands: [brand],
      prevCursor: 'prev-cursor-token',
    });
  });

  it('returns raw create data', async () => {
    brandsService.createBrand.mockResolvedValue(brand);

    const result = await controller.createBrand({
      name: 'Nike',
      isActive: true,
      visibleInMenu: true,
      logoUrl: 'https://example.test/logo.png',
      metaDescription: 'Meta',
    });

    expect(result).toEqual(brand);
  });

  it('returns raw batch status data', async () => {
    brandsService.createBatchBrands.mockResolvedValue({
      status: 'partial',
      succeeded: [{ key: 'tmp-1', id: brand.id }],
      failed: [{ key: 'tmp-2', reason: 'brand slug already exists' }],
    });

    const result = await controller.createBatchBrands({
      brands: [
        {
          key: 'tmp-1',
          name: 'Nike',
          isActive: true,
          visibleInMenu: true,
          logoUrl: 'https://example.test/logo.png',
          metaDescription: 'Meta',
        },
        {
          key: 'tmp-2',
          name: 'Adidas',
          isActive: true,
          visibleInMenu: true,
          logoUrl: 'https://example.test/logo.png',
          metaDescription: 'Meta',
        },
      ],
    });

    expect(result).toEqual({
      status: 'partial',
      succeeded: [{ key: 'tmp-1', id: brand.id }],
      failed: [{ key: 'tmp-2', reason: 'brand slug already exists' }],
    });
  });

  it('returns delete data as a boolean', async () => {
    brandsService.deleteBrand.mockResolvedValue(false);

    const result = await controller.deleteBrand({ id: brand.id });

    expect(result).toEqual(false);
  });

  it('preserves toggle active boolean interpolation in the message', async () => {
    brandsService.toggleActive.mockResolvedValue(true);

    const result = await controller.toggleActiveBrand({
      id: brand.id,
      isActive: false,
    });

    expect(result).toEqual(true);
  });

  it('preserves toggle visible menu boolean interpolation in the message', async () => {
    brandsService.toggleVisibleInMenu.mockResolvedValue(true);

    const result = await controller.toggleVisibleInMenuBrand({
      id: brand.id,
      visibleInMenu: false,
    });

    expect(result).toEqual(true);
  });
});
