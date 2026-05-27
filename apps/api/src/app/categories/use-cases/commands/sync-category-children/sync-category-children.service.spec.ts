jest.mock('../../../../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateCategoryService } from '../create-category/create-category.service';
import { DeleteCategoryService } from '../delete-category/delete-category.service';
import { UpdateCategoryService } from '../update-category/update-category.service';
import { SyncCategoryChildrenService } from './sync-category-children.service';

describe('SyncCategoryChildrenService', () => {
  const id = '018f4dc4-5f51-7c55-9b8f-15fbdd99b101';
  let category: { findFirst: jest.Mock };
  let createCategory: jest.Mocked<Pick<CreateCategoryService, 'execute'>>;
  let updateCategory: jest.Mocked<Pick<UpdateCategoryService, 'execute'>>;
  let deleteCategory: jest.Mocked<Pick<DeleteCategoryService, 'execute'>>;
  let service: SyncCategoryChildrenService;

  beforeEach(() => {
    category = { findFirst: jest.fn() };
    createCategory = { execute: jest.fn() };
    updateCategory = { execute: jest.fn() };
    deleteCategory = { execute: jest.fn() };
    service = new SyncCategoryChildrenService(
      { client: { category } } as PrismaService,
      createCategory as CreateCategoryService,
      updateCategory as UpdateCategoryService,
      deleteCategory as DeleteCategoryService,
    );
  });

  it('returns grouped sync results for create, update, and delete operations', async () => {
    category.findFirst.mockResolvedValue({ id });
    createCategory.execute.mockResolvedValue({ id: 'created-id' } as never);
    updateCategory.execute.mockResolvedValue({ id: 'updated-id' } as never);
    deleteCategory.execute.mockResolvedValue({
      category: { id: 'deleted-id' },
    } as never);

    await expect(
      service.execute({
        id,
        newCategories: [
          {
            key: 'tmp-1',
            name: 'Child',
            isActive: true,
            visibleInMenu: true,
          },
        ],
        updateCategories: [{ id: 'updated-id', changes: { name: 'Updated' } }],
        deleteCategories: ['deleted-id'],
      }),
    ).resolves.toEqual({
      status: 'success',
      created: { succeeded: [{ key: 'tmp-1', id: 'created-id' }], failed: [] },
      updated: { succeeded: [{ id: 'updated-id' }], failed: [] },
      deleted: { succeeded: [{ id: 'deleted-id' }], failed: [] },
    });
  });

  it('returns partial when at least one sync operation fails', async () => {
    category.findFirst.mockResolvedValue({ id });
    createCategory.execute.mockRejectedValue(new Error('slug already exists'));
    updateCategory.execute.mockResolvedValue({ id: 'updated-id' } as never);
    deleteCategory.execute.mockResolvedValue({
      category: { id: 'deleted-id' },
    } as never);

    await expect(
      service.execute({
        id,
        newCategories: [
          {
            key: 'tmp-1',
            name: 'Child',
            isActive: true,
            visibleInMenu: true,
          },
        ],
        updateCategories: [{ id: 'updated-id', changes: { name: 'Updated' } }],
        deleteCategories: ['deleted-id'],
      }),
    ).resolves.toMatchObject({
      status: 'partial',
      created: {
        succeeded: [],
        failed: [{ key: 'tmp-1', reason: 'slug already exists' }],
      },
      updated: { succeeded: [{ id: 'updated-id' }], failed: [] },
      deleted: { succeeded: [{ id: 'deleted-id' }], failed: [] },
    });
  });
});
