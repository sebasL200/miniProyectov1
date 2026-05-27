jest.mock('../../../../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../../../prisma/prisma.service';
import { GetCategoryService } from './get-category.service';

describe('GetCategoryService', () => {
  const id = '018f4dc4-5f51-7c55-9b8f-15fbdd99b101';
  const childId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b102';
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
  let category: { findFirst: jest.Mock; findMany: jest.Mock };
  let service: GetCategoryService;

  beforeEach(() => {
    category = {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    };
    service = new GetCategoryService({
      client: { category },
    } as PrismaService);
  });

  it('returns a single category by id', async () => {
    category.findFirst.mockResolvedValue(row);

    await expect(service.execute({ id })).resolves.toMatchObject({
      id,
      name: 'Category',
    });

    expect(category.findMany).not.toHaveBeenCalled();
  });

  it('returns a category with children when requested', async () => {
    category.findFirst.mockResolvedValue(row);
    category.findMany
      .mockResolvedValueOnce([
        { ...row, id: childId, name: 'Child', parentId: id },
      ])
      .mockResolvedValueOnce([]);

    await expect(
      service.execute({ id, include: 'children' }),
    ).resolves.toMatchObject({
      id,
      children: [{ id: childId, name: 'Child', children: [] }],
    });
  });
});
