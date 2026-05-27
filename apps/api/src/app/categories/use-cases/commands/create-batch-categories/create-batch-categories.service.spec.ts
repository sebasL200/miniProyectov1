import { CreateCategoryService } from '../create-category/create-category.service';
import { CreateBatchCategoriesService } from './create-batch-categories.service';

describe('CreateBatchCategoriesService', () => {
  let createCategory: jest.Mocked<Pick<CreateCategoryService, 'execute'>>;
  let service: CreateBatchCategoriesService;

  beforeEach(() => {
    createCategory = { execute: jest.fn() };
    service = new CreateBatchCategoriesService(
      createCategory as CreateCategoryService,
    );
  });

  it('returns success when all batch items are created', async () => {
    createCategory.execute.mockResolvedValue({ id: 'category-id' } as never);

    await expect(
      service.execute({
        categories: [
          {
            key: 'tmp-1',
            name: 'Category',
            isActive: true,
            visibleInMenu: true,
          },
        ],
      }),
    ).resolves.toEqual({
      status: 'success',
      succeeded: [{ key: 'tmp-1', id: 'category-id' }],
      failed: [],
    });
  });

  it('returns partial when some batch items fail', async () => {
    createCategory.execute
      .mockResolvedValueOnce({ id: 'category-id' } as never)
      .mockRejectedValueOnce(new Error('slug already exists'));

    await expect(
      service.execute({
        categories: [
          {
            key: 'tmp-1',
            name: 'Category',
            isActive: true,
            visibleInMenu: true,
          },
          {
            key: 'tmp-2',
            name: 'Duplicate',
            isActive: true,
            visibleInMenu: true,
          },
        ],
      }),
    ).resolves.toEqual({
      status: 'partial',
      succeeded: [{ key: 'tmp-1', id: 'category-id' }],
      failed: [{ key: 'tmp-2', reason: 'slug already exists' }],
    });
  });

  it('returns failed when no batch items are created', async () => {
    createCategory.execute.mockRejectedValue(new Error('slug already exists'));

    await expect(
      service.execute({
        categories: [
          {
            key: 'tmp-1',
            name: 'Category',
            isActive: true,
            visibleInMenu: true,
          },
        ],
      }),
    ).resolves.toEqual({
      status: 'failed',
      succeeded: [],
      failed: [{ key: 'tmp-1', reason: 'slug already exists' }],
    });
  });
});
