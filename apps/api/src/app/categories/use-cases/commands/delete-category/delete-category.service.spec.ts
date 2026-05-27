jest.mock('../../../../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { DeleteCategoryService } from './delete-category.service';

describe('DeleteCategoryService', () => {
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
  let category: { findFirst: jest.Mock; update: jest.Mock };
  let service: DeleteCategoryService;

  beforeEach(() => {
    category = {
      findFirst: jest.fn(),
      update: jest.fn(),
    };
    service = new DeleteCategoryService({
      client: { category },
    } as PrismaService);
  });

  it('wraps deleted category results for the legacy delete contract', async () => {
    category.findFirst.mockResolvedValueOnce(row).mockResolvedValueOnce(null);
    category.update.mockResolvedValue({ ...row, deletedAt: new Date() });

    await expect(service.execute({ id })).resolves.toMatchObject({
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

    await expect(service.execute({ id })).rejects.toEqual(
      new BadRequestException('category has children'),
    );
    expect(category.update).not.toHaveBeenCalled();
  });
});
