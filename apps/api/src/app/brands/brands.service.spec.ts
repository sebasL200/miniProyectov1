import { ConflictException, NotFoundException } from '@nestjs/common';

jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { BrandsService } from './brands.service';
import { PaginationService } from '../common/pagination/pagination.service';

describe('BrandsService', () => {
  const id = '018f4dc4-5f51-7c55-9b8f-15fbdd99b101';
  const row = {
    id,
    name: 'Brand',
    logoUrl: 'https://example.com/logo.png',
    visibleInMenu: true,
    slug: 'brand',
    description: 'text',
    website: 'https://example.com',
    metaTitle: 'Meta title',
    metaDescription: 'Meta description',
    isActive: true,
    createdAt: new Date('2026-04-13T00:00:00.000Z'),
    updatedAt: new Date('2026-04-13T00:00:00.000Z'),
    deletedAt: null,
  };

  let brand: {
    create: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    count: jest.Mock;
    update: jest.Mock;
  };
  let service: BrandsService;

  beforeEach(() => {
    brand = {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    };
    service = new BrandsService(
      {
        client: { brand },
      } as never,
      new PaginationService(),
    );
  });

  it('creates a brand through Prisma ORM and preserves output fields', async () => {
    brand.findFirst.mockResolvedValue(null);
    brand.create.mockResolvedValue(row);

    await expect(
      service.createBrand({
        name: 'Brand',
        isActive: true,
        visibleInMenu: true,
        logoUrl: 'https://example.com/logo.png',
        website: 'https://example.com',
        metaTitle: 'Meta title',
        metaDescription: 'Meta description',
      }),
    ).resolves.toEqual({
      id,
      name: 'Brand',
      logoUrl: 'https://example.com/logo.png',
      visibleInMenu: true,
      slug: 'brand',
      description: 'text',
      website: 'https://example.com',
      metaTitle: 'Meta title',
      metaDescription: 'Meta description',
      isActive: true,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });

    expect(brand.create).toHaveBeenCalledWith({
      data: {
        name: 'Brand',
        description: null,
        slug: 'brand',
        logoUrl: 'https://example.com/logo.png',
        isActive: true,
        visibleInMenu: true,
        website: 'https://example.com',
        metaTitle: 'Meta title',
        metaDescription: 'Meta description',
      },
    });
  });

  it('turns create slug conflicts into raw errors for legacy 500 handling', async () => {
    brand.findFirst.mockResolvedValue({ id: 'other' });

    await expect(
      service.createBrand({
        name: 'Brand',
        isActive: true,
        visibleInMenu: true,
        logoUrl: 'https://example.com/logo.png',
        metaDescription: 'Meta description',
      }),
    ).rejects.toThrow('brand slug already exists');

    await expect(
      service.createBrand({
        name: 'Brand',
        isActive: true,
        visibleInMenu: true,
        logoUrl: 'https://example.com/logo.png',
        metaDescription: 'Meta description',
      }),
    ).rejects.not.toBeInstanceOf(ConflictException);
  });

  it('returns offset list data from findMany and count', async () => {
    brand.findMany.mockResolvedValue([row]);
    brand.count.mockResolvedValue(1);

    await expect(
      service.listBrands({ page: 1, pageSize: 10, name: 'Bra' }),
    ).resolves.toMatchObject({
      brands: [{ id, name: 'Brand' }],
      totalCount: 1,
      totalPages: 1,
    });

    expect(brand.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { deletedAt: null },
          { name: { contains: 'Bra', mode: 'insensitive' } },
        ],
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 10,
      skip: 0,
    });
    expect(brand.count).toHaveBeenCalledWith({
      where: {
        AND: [
          { deletedAt: null },
          { name: { contains: 'Bra', mode: 'insensitive' } },
        ],
      },
    });
  });

  it('returns cursor list data without a search query', async () => {
    brand.findMany.mockResolvedValue([row]);

    await expect(
      service.listBrands({ pageSize: 10, paginationType: 'cursor' }),
    ).resolves.toMatchObject({
      brands: [{ id, name: 'Brand' }],
    });

    expect(brand.findMany).toHaveBeenCalledWith({
      where: {
        AND: [{ deletedAt: null }],
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 11,
      skip: 0,
    });
  });

  it('updates only provided non-null brand fields', async () => {
    brand.findFirst.mockResolvedValueOnce(row).mockResolvedValueOnce(null);
    brand.update.mockResolvedValue({
      ...row,
      name: 'New Brand',
      slug: 'new-brand',
      visibleInMenu: false,
    });

    await expect(
      service.updateBrand(id, {
        name: 'New Brand',
        logoUrl: null,
        visibleInMenu: false,
      } as never),
    ).resolves.toMatchObject({
      id,
      name: 'New Brand',
      slug: 'new-brand',
      visibleInMenu: false,
    });

    expect(brand.update).toHaveBeenCalledWith({
      where: { id },
      data: {
        name: 'New Brand',
        slug: 'new-brand',
        visibleInMenu: false,
        updatedAt: expect.any(Date),
      },
    });
  });

  it('maps website to Prisma website when updating a brand', async () => {
    brand.findFirst.mockResolvedValueOnce(row).mockResolvedValueOnce(null);
    brand.update.mockResolvedValue({
      ...row,
      name: 'testing something',
      description: '',
      logoUrl: '',
      website: '',
      metaTitle: '',
      metaDescription: '',
      slug: 'testing-smth',
      visibleInMenu: true,
    });

    await expect(
      service.updateBrand(id, {
        name: 'testing something',
        description: '',
        isActive: true,
        logoUrl: '',
        website: '',
        metaTitle: '',
        metaDescription: '',
        slug: 'testing-smth',
        visibleInMenu: true,
      }),
    ).resolves.toMatchObject({
      id,
      name: 'testing something',
      slug: 'testing-smth',
      website: '',
      visibleInMenu: true,
    });

    expect(brand.update).toHaveBeenCalledWith({
      where: { id },
      data: {
        name: 'testing something',
        description: '',
        isActive: true,
        logoUrl: '',
        website: '',
        metaTitle: '',
        metaDescription: '',
        slug: 'testing-smth',
        visibleInMenu: true,
        updatedAt: expect.any(Date),
      },
    });
    expect(brand.update.mock.calls[0][0].data).toHaveProperty('website', '');
  });

  it('returns false when deleting a missing brand', async () => {
    brand.findFirst.mockResolvedValue(null);

    await expect(service.deleteBrand(id)).resolves.toBe(false);
    expect(brand.update).not.toHaveBeenCalled();
  });

  it('soft deletes an existing brand through Prisma ORM', async () => {
    brand.findFirst.mockResolvedValue(row);
    brand.update.mockResolvedValue({ ...row, deletedAt: new Date() });

    await expect(service.deleteBrand(id)).resolves.toBe(true);
    expect(brand.update).toHaveBeenCalledWith({
      where: { id },
      data: {
        isActive: false,
        visibleInMenu: false,
        deletedAt: expect.any(Date),
        updatedAt: expect.any(Date),
      },
    });
  });

  it('throws not found before toggling a missing brand', async () => {
    brand.findFirst.mockResolvedValue(null);

    await expect(
      service.toggleActive({ id, isActive: false }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(brand.update).not.toHaveBeenCalled();
  });
});
