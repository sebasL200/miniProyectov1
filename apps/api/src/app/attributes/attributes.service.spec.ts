jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { BadRequestException, ConflictException } from '@nestjs/common';
import { AttributesService } from './attributes.service';
import { PaginationService } from '../common/pagination/pagination.service';

describe('AttributesService', () => {
  const id = '018f4dc4-5f51-7c55-9b8f-15fbdd99b101';
  const categoryId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b102';
  const row = {
    id,
    name: 'Color',
    slug: 'color',
    description: 'text',
    displayOrder: 1,
    isActive: true,
    isFilterable: false,
    isRequired: false,
    appliesToAll: false,
    version: 1,
    createdAt: new Date('2026-04-13T00:00:00.000Z'),
    updatedAt: new Date('2026-04-13T00:00:00.000Z'),
    deletedAt: null,
    categoryLinks: [
      {
        category: {
          id: categoryId,
          name: 'Category',
          slug: 'category',
          deletedAt: null,
        },
      },
    ],
  };

  let attribute: {
    create: jest.Mock;
    findFirst: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
    count: jest.Mock;
  };
  let category: { findMany: jest.Mock };
  let categoryAttribute: { deleteMany: jest.Mock; createMany: jest.Mock };
  let service: AttributesService;

  beforeEach(() => {
    attribute = {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    };
    category = { findMany: jest.fn() };
    categoryAttribute = {
      deleteMany: jest.fn(),
      createMany: jest.fn(),
    };
    service = new AttributesService(
      {
        client: { attribute, category, categoryAttribute },
      } as never,
      new PaginationService(),
    );
  });

  it('creates an attribute through Prisma ORM and maps output fields', async () => {
    category.findMany.mockResolvedValue([
      { id: categoryId, name: 'Category', slug: 'category' },
    ]);
    attribute.findFirst.mockResolvedValue(null);
    attribute.findMany.mockResolvedValue([]);
    attribute.updateMany.mockResolvedValue({ count: 0 });
    attribute.create.mockResolvedValue(row);

    await expect(
      service.createAttribute({
        name: 'Color',
        categoryIds: [categoryId],
      }),
    ).resolves.toMatchObject({
      id,
      name: 'Color',
      slug: 'color',
      categories: [{ id: categoryId, name: 'Category', slug: 'category' }],
    });

    expect(attribute.create).toHaveBeenCalledWith({
      data: {
        name: 'Color',
        slug: 'color',
        description: null,
        displayOrder: 1,
        isActive: true,
        isFilterable: false,
        isRequired: false,
        appliesToAll: false,
        categoryLinks: {
          create: [{ category: { connect: { id: categoryId } } }],
        },
      },
      include: expect.any(Object),
    });
  });

  it('rejects invalid category selections with the legacy BFF message', async () => {
    category.findMany.mockResolvedValue([]);

    await expect(
      service.createAttribute({
        name: 'Color',
        categoryIds: [categoryId],
      }),
    ).rejects.toEqual(
      new BadRequestException('Una o más categorías no son válidas'),
    );
  });

  it('rejects live duplicate names before create', async () => {
    category.findMany.mockResolvedValue([
      { id: categoryId, name: 'Category', slug: 'category' },
    ]);
    attribute.findFirst.mockResolvedValue({ id: 'other' });

    await expect(
      service.createAttribute({
        name: 'Color',
        categoryIds: [categoryId],
      }),
    ).rejects.toEqual(new ConflictException('attribute name already exists'));
  });

  it('returns offset list data from findMany and count', async () => {
    attribute.findMany.mockResolvedValue([row]);
    attribute.count.mockResolvedValue(1);

    await expect(
      service.listAttributes({ page: 1, pageSize: 10 }),
    ).resolves.toMatchObject({
      attributes: [
        {
          id,
          name: 'Color',
          categories: [{ id: categoryId, name: 'Category', slug: 'category' }],
        },
      ],
      totalCount: 1,
      totalPages: 1,
    });

    expect(attribute.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null, appliesToAll: false },
      include: expect.any(Object),
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
      take: 10,
      skip: 0,
    });
  });

  it('returns unpaginated list data without count or window arguments', async () => {
    attribute.findMany.mockResolvedValue([row]);

    await expect(
      service.listAttributes({
        categoryIds: [categoryId],
        paginationType: 'none',
      }),
    ).resolves.toMatchObject({
      attributes: [
        {
          id,
          name: 'Color',
          categories: [{ id: categoryId, name: 'Category', slug: 'category' }],
        },
      ],
    });

    expect(attribute.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        appliesToAll: false,
        categoryLinks: {
          some: {
            categoryId: { in: [categoryId] },
          },
        },
      },
      include: expect.any(Object),
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
    });
    expect(attribute.count).not.toHaveBeenCalled();
  });

  it('returns cursor list data without counting total records', async () => {
    attribute.findMany.mockResolvedValue([row]);

    await expect(
      service.listAttributes({ pageSize: 10, paginationType: 'cursor' }),
    ).resolves.toMatchObject({
      attributes: [
        {
          id,
          name: 'Color',
          categories: [{ id: categoryId, name: 'Category', slug: 'category' }],
        },
      ],
      nextCursor: null,
      prevCursor: null,
    });

    expect(attribute.findMany).toHaveBeenCalledWith({
      where: { deletedAt: null, appliesToAll: false },
      include: expect.any(Object),
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
      take: 11,
      skip: 0,
    });
    expect(attribute.count).not.toHaveBeenCalled();
  });

  it('filters list data by one or more category ids', async () => {
    const nextCategoryId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b103';
    attribute.findMany.mockResolvedValue([row]);
    attribute.count.mockResolvedValue(1);

    await expect(
      service.listAttributes({
        page: 1,
        pageSize: 10,
        categoryIds: [categoryId, nextCategoryId],
      }),
    ).resolves.toMatchObject({
      attributes: [
        {
          id,
          name: 'Color',
          categories: [{ id: categoryId, name: 'Category', slug: 'category' }],
        },
      ],
      totalCount: 1,
      totalPages: 1,
    });

    const where = {
      deletedAt: null,
      appliesToAll: false,
      categoryLinks: {
        some: {
          categoryId: { in: [categoryId, nextCategoryId] },
        },
      },
    };
    expect(attribute.findMany).toHaveBeenCalledWith({
      where,
      include: expect.any(Object),
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
      take: 10,
      skip: 0,
    });
    expect(attribute.count).toHaveBeenCalledWith({ where });
  });

  it('excludes attributes linked to category ids when requested', async () => {
    attribute.findMany.mockResolvedValue([row]);
    attribute.count.mockResolvedValue(1);

    await expect(
      service.listAttributes({
        page: 1,
        pageSize: 10,
        categoryIds: [categoryId],
        exclude: ['categoryIds'],
      }),
    ).resolves.toMatchObject({
      attributes: [
        {
          id,
          name: 'Color',
          categories: [{ id: categoryId, name: 'Category', slug: 'category' }],
        },
      ],
      totalCount: 1,
      totalPages: 1,
    });

    expect(attribute.findMany).toHaveBeenCalledWith({
      where: {
        deletedAt: null,
        appliesToAll: false,
        categoryLinks: {
          none: {
            categoryId: { in: [categoryId] },
          },
        },
      },
      include: expect.any(Object),
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
      take: 10,
      skip: 0,
    });
  });

  it('filters list data by global attributes when appliesToAll is true', async () => {
    attribute.findMany.mockResolvedValue([{ ...row, appliesToAll: true }]);
    attribute.count.mockResolvedValue(1);

    await expect(
      service.listAttributes({ page: 1, pageSize: 10, appliesToAll: true }),
    ).resolves.toMatchObject({
      attributes: [
        {
          id,
          name: 'Color',
          appliesToAll: true,
        },
      ],
      totalCount: 1,
      totalPages: 1,
    });

    const where = {
      deletedAt: null,
      appliesToAll: true,
    };
    expect(attribute.findMany).toHaveBeenCalledWith({
      where,
      include: expect.any(Object),
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
      take: 10,
      skip: 0,
    });
    expect(attribute.count).toHaveBeenCalledWith({ where });
  });

  it('combines category and appliesToAll filters with OR when requested', async () => {
    attribute.findMany.mockResolvedValue([row, { ...row, appliesToAll: true }]);
    attribute.count.mockResolvedValue(2);

    await expect(
      service.listAttributes({
        page: 1,
        pageSize: 10,
        categoryIds: [categoryId],
        appliesToAll: true,
        or: ['categoryIds', 'appliesToAll'],
      }),
    ).resolves.toMatchObject({
      totalCount: 2,
      totalPages: 1,
    });

    const where = {
      deletedAt: null,
      OR: [
        {
          appliesToAll: true,
        },
        {
          categoryLinks: {
            some: {
              categoryId: { in: [categoryId] },
            },
          },
        },
      ],
    };
    expect(attribute.findMany).toHaveBeenCalledWith({
      where,
      include: expect.any(Object),
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
      take: 10,
      skip: 0,
    });
    expect(attribute.count).toHaveBeenCalledWith({ where });
  });

  it('updates with an optimistic version check and replaces category links', async () => {
    const nextCategoryId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b103';
    attribute.findFirst
      .mockResolvedValueOnce(row)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({
        ...row,
        name: 'Size',
        slug: 'size',
        version: 2,
        categoryLinks: [
          {
            category: {
              id: nextCategoryId,
              name: 'Next',
              slug: 'next',
              deletedAt: null,
            },
          },
        ],
      });
    category.findMany.mockResolvedValue([
      { id: nextCategoryId, name: 'Next', slug: 'next' },
    ]);
    attribute.updateMany.mockResolvedValue({ count: 1 });

    await expect(
      service.updateAttribute(
        id,
        { name: 'Size', categoryIds: [nextCategoryId] },
        1,
      ),
    ).resolves.toMatchObject({
      attribute: {
        id,
        name: 'Size',
        slug: 'size',
        categories: [{ id: nextCategoryId, name: 'Next', slug: 'next' }],
      },
      version: 2,
    });

    expect(attribute.updateMany).toHaveBeenCalledWith({
      where: { id, version: 1, deletedAt: null },
      data: expect.objectContaining({
        name: 'Size',
        slug: 'size',
        version: { increment: 1 },
      }),
    });
    expect(categoryAttribute.deleteMany).toHaveBeenCalledWith({
      where: { attributeId: id },
    });
    expect(categoryAttribute.createMany).toHaveBeenCalledWith({
      data: [{ attributeId: id, categoryId: nextCategoryId }],
      skipDuplicates: true,
    });
  });

  it('rejects stale If-Match versions', async () => {
    attribute.findFirst.mockResolvedValue(row);

    await expect(
      service.updateAttribute(id, { name: 'Size' }, 2),
    ).rejects.toEqual(
      new BadRequestException(
        'the resource has been modified by another request',
      ),
    );
    expect(attribute.updateMany).not.toHaveBeenCalled();
  });

  it('soft deletes an existing attribute through Prisma ORM', async () => {
    attribute.findFirst.mockResolvedValue(row);
    attribute.update.mockResolvedValue({ ...row, deletedAt: new Date() });

    await expect(service.deleteAttribute(id)).resolves.toMatchObject({
      id,
      name: 'Color',
    });
    expect(attribute.update).toHaveBeenCalledWith({
      where: { id },
      data: {
        deletedAt: expect.any(Date),
        version: { increment: 1 },
        updatedAt: expect.any(Date),
      },
      include: expect.any(Object),
    });
  });
});
