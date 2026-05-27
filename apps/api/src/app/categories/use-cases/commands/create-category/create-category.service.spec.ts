jest.mock('../../../../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateCategoryService } from './create-category.service';

describe('CreateCategoryService', () => {
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
  let category: { create: jest.Mock; findFirst: jest.Mock };
  let service: CreateCategoryService;

  beforeEach(() => {
    category = {
      create: jest.fn(),
      findFirst: jest.fn(),
    };
    service = new CreateCategoryService({
      client: { category },
    } as PrismaService);
  });

  it('creates a category through Prisma ORM and maps output fields', async () => {
    category.findFirst.mockResolvedValueOnce(row).mockResolvedValueOnce(null);
    category.create.mockResolvedValue(row);

    await expect(
      service.execute({
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
      service.execute({
        name: 'Category',
        isActive: true,
        visibleInMenu: true,
      }),
    ).rejects.toEqual(new ConflictException('slug already exists'));
  });
});
