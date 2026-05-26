jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { BadRequestException, ConflictException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { PaginationService } from '../common/pagination/pagination.service';

describe('CategoriesService', () => {
  const id = '018f4dc4-5f51-7c55-9b8f-15fbdd99b101';
  const parentId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b102';
  const row = {
    id,
    name: 'Category',
    slug: 'category',
    isActive: true,
    visibleInMenu: true,
    parentId,
    parent: { id: parentId, name: 'Parent', slug: 'parent' },
    attributes: [],
    description: 'text',
    imageUrl: 'data:image/png;base64,category',
    metaTitle: 'Meta title',
    metaDescription: 'Meta description',
    createdAt: new Date('2026-04-13T00:00:00.000Z'),
    updatedAt: new Date('2026-04-13T00:00:00.000Z'),
    deletedAt: null,
  };

  let category: {
    create: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
    count: jest.Mock;
  };
  let service: CategoriesService;

  beforeEach(() => {
    category = {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    };
    service = new CategoriesService(
      {
        client: { category },
      } as never,
      new PaginationService(),
    );
  });

  it('creates a category through Prisma ORM and maps output fields', async () => {
    category.findFirst.mockResolvedValueOnce(row).mockResolvedValueOnce(null);
    category.create.mockResolvedValue(row);

    await expect(
      service.createCategory({
        name: 'Category',
        parentId,
        isActive: true,
        visibleInMenu: true,
      }),
    ).resolves.toEqual({
      id,
      name: 'Category',
      slug: 'category',
      isActive: true,
      visibleInMenu: true,
      parent: { id: parentId, name: 'Parent', slug: 'parent' },
      hasAttributes: false,
      parentId,
      parentName: 'Parent',
      description: 'text',
      imageUrl: 'data:image/png;base64,category',
      metaTitle: 'Meta title',
      metaDescription: 'Meta description',
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });

    expect(category.create).toHaveBeenCalledWith({
      data: {
        name: 'Category',
        slug: 'category',
        parentId,
        description: null,
        imageUrl: null,
        metaTitle: 'Category',
        metaDescription: null,
        isActive: true,
        visibleInMenu: true,
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        attributes: {
          where: { attribute: { deletedAt: null } },
          select: { id: true },
          take: 1,
        },
      },
    });
  });

  it('rejects live duplicate slugs before create', async () => {
    category.findFirst.mockResolvedValue({ id: 'other' });

    await expect(
      service.createCategory({
        name: 'Category',
        isActive: true,
        visibleInMenu: true,
      }),
    ).rejects.toEqual(new ConflictException('slug already exists'));
  });

  it('returns offset list data from findMany and count', async () => {
    category.findMany.mockResolvedValue([
      { ...row, attributes: [{ id: 'category-attribute-id' }] },
    ]);
    category.count.mockResolvedValue(1);

    await expect(
      service.listCategories({ page: 1, pageSize: 10, query: 'Cat' }),
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

  it('returns cursor list data without a search query', async () => {
    category.findMany.mockResolvedValue([row]);

    await expect(
      service.listCategories({ pageSize: 10, paginationType: 'cursor' }),
    ).resolves.toMatchObject({
      categories: [{ id, name: 'Category' }],
    });

    expect(category.findMany).toHaveBeenCalledWith({
      where: {
        AND: [{ deletedAt: null }],
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
      take: 11,
      skip: 0,
    });
  });

  it('wraps deleted category results for the legacy delete contract', async () => {
    category.findFirst.mockResolvedValueOnce(row).mockResolvedValueOnce(null);
    category.update.mockResolvedValue({ ...row, deletedAt: new Date() });

    await expect(service.deleteCategory(id)).resolves.toMatchObject({
      category: {
        id,
        name: 'Category',
      },
    });

    expect(category.update).toHaveBeenCalledWith({
      where: { id },
      data: {
        deletedAt: expect.any(Date),
        isActive: false,
      },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        attributes: {
          where: { attribute: { deletedAt: null } },
          select: { id: true },
          take: 1,
        },
      },
    });
  });

  it('rejects deleting categories with children', async () => {
    category.findFirst
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce({ id: 'child' });

    await expect(service.deleteCategory(id)).rejects.toEqual(
      new BadRequestException('category has children'),
    );
    expect(category.update).not.toHaveBeenCalled();
  });

  it('returns grouped sync results for create, update, and delete operations', async () => {
    category.findFirst
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce({ id: 'duplicate' });

    await expect(
      service.syncCategoryChildren({
        id,
        newCategories: [
          {
            key: '92c48467-76aa-4788-8aaf-1dbf2d9be8e1',
            name: 'Category',
            isActive: true,
            visibleInMenu: true,
          },
        ],
        updateCategories: [],
        deleteCategories: [],
      }),
    ).resolves.toEqual({
      status: 'failed',
      created: {
        succeeded: [],
        failed: [
          {
            key: '92c48467-76aa-4788-8aaf-1dbf2d9be8e1',
            reason: 'slug already exists',
          },
        ],
      },
      updated: {
        succeeded: [],
        failed: [],
      },
      deleted: {
        succeeded: [],
        failed: [],
      },
    });
  });
});
