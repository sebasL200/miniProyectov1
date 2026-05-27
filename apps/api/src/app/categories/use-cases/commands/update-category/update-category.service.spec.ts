jest.mock('../../../../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateCategoryService } from './update-category.service';

describe('UpdateCategoryService', () => {
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
  let category: {
    findFirst: jest.Mock;
    findMany: jest.Mock;
    update: jest.Mock;
    updateMany: jest.Mock;
  };
  let service: UpdateCategoryService;

  beforeEach(() => {
    category = {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
    };
    service = new UpdateCategoryService({
      client: { category },
    } as PrismaService);
  });

  it('updates a category and regenerates the slug when the name changes', async () => {
    category.findFirst.mockResolvedValueOnce(row).mockResolvedValueOnce(null);
    category.update.mockResolvedValue({
      ...row,
      name: 'Updated',
      slug: 'updated',
    });

    await expect(
      service.execute({ id, changes: { name: 'Updated' } }),
    ).resolves.toMatchObject({
      id,
      name: 'Updated',
      slug: 'updated',
    });

    expect(category.update).toHaveBeenCalledWith({
      where: { id },
      data: expect.objectContaining({
        name: 'Updated',
        slug: 'updated',
      }),
      include: expect.any(Object),
    });
  });

  it('rejects circular hierarchy changes', async () => {
    category.findFirst.mockResolvedValue(row);

    await expect(
      service.execute({ id, changes: { parentId: id } }),
    ).rejects.toEqual(new BadRequestException('circular reference detected'));
  });

  it('deactivates descendants when an active category is deactivated', async () => {
    category.findFirst.mockResolvedValue(row);
    category.findMany
      .mockResolvedValueOnce([{ ...row, id: childId, parentId: id }])
      .mockResolvedValueOnce([]);
    category.update.mockResolvedValue({ ...row, isActive: false });

    await service.execute({ id, changes: { isActive: false } });

    expect(category.updateMany).toHaveBeenCalledWith({
      where: { id: { in: [childId] } },
      data: { isActive: false },
    });
  });
});
