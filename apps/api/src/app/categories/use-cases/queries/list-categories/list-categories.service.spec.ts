jest.mock('../../../../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PaginationService } from '../../../../common/pagination/pagination.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ListCategoriesService } from './list-categories.service';

describe('ListCategoriesService', () => {
  const id = '018f4dc4-5f51-7c55-9b8f-15fbdd99b101';
  const row = {
    id,
    name: 'Category',
    slug: 'category',
    isActive: true,
    visibleInMenu: true,
    parentId: null,
    parent: null,
    attributes: [],
    description: null,
    imageUrl: null,
    metaTitle: null,
    metaDescription: null,
    createdAt: new Date('2026-04-13T00:00:00.000Z'),
    updatedAt: new Date('2026-04-13T00:00:00.000Z'),
    deletedAt: null,
  };
  let category: { findMany: jest.Mock; count: jest.Mock };
  let service: ListCategoriesService;

  beforeEach(() => {
    category = {
      findMany: jest.fn(),
      count: jest.fn(),
    };
    service = new ListCategoriesService(
      { client: { category } } as PrismaService,
      new PaginationService(),
    );
  });

  it('returns offset list data from findMany and count', async () => {
    category.findMany.mockResolvedValue([
      { ...row, attributes: [{ id: 'category-attribute-id' }] },
    ]);
    category.count.mockResolvedValue(1);

    await expect(
      service.execute({
        page: 1,
        pageSize: 10,
        query: 'Cat',
        isActive: true,
      }),
    ).resolves.toMatchObject({
      categories: [{ id, name: 'Category', hasAttributes: true }],
      totalCount: 1,
      totalPages: 1,
    });

    expect(category.findMany).toHaveBeenCalledWith({
      where: {
        AND: [
          { deletedAt: null },
          {
            OR: [
              { name: { contains: 'Cat', mode: 'insensitive' } },
              { slug: { contains: 'Cat', mode: 'insensitive' } },
            ],
          },
          { isActive: true },
        ],
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        attributes: {
          where: { attribute: { deletedAt: null } },
          select: { id: true },
          take: 1,
        },
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 10,
      skip: 0,
    });
  });

  it('orders category lists by createdAt descending when order is createdAt', async () => {
    category.findMany.mockResolvedValue([row]);
    category.count.mockResolvedValue(1);

    await service.execute({
      page: 1,
      pageSize: 10,
      order: 'createdAt',
    });

    expect(category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      }),
    );
  });

  it('orders category lists by createdAt ascending when order is -createdAt', async () => {
    category.findMany.mockResolvedValue([row]);
    category.count.mockResolvedValue(1);

    await service.execute({
      page: 1,
      pageSize: 10,
      order: '-createdAt',
    });

    expect(category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
      }),
    );
  });

  it('returns cursor list data and cursor metadata', async () => {
    category.findMany.mockResolvedValue([
      row,
      { ...row, id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b103', name: 'Next' },
    ]);

    const result = await service.execute({
      pageSize: 1,
      paginationType: 'cursor',
      isActive: false,
    });

    expect(result).toMatchObject({
      categories: [{ id, name: 'Category' }],
      nextCursor: expect.any(String),
    });
    expect(category.findMany).toHaveBeenCalledWith({
      where: {
        AND: [{ deletedAt: null }, { isActive: false }],
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        attributes: {
          where: { attribute: { deletedAt: null } },
          select: { id: true },
          take: 1,
        },
      },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      take: 2,
      skip: 0,
    });
  });
});
