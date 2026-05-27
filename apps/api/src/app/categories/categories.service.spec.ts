import { CategoriesService } from './categories.service';
import { CreateBatchCategoriesService } from './use-cases/commands/create-batch-categories/create-batch-categories.service';
import { CreateCategoryService } from './use-cases/commands/create-category/create-category.service';
import { DeleteCategoryService } from './use-cases/commands/delete-category/delete-category.service';
import { SyncCategoryChildrenService } from './use-cases/commands/sync-category-children/sync-category-children.service';
import { UpdateCategoryService } from './use-cases/commands/update-category/update-category.service';
import { GetCategoryService } from './use-cases/queries/get-category/get-category.service';
import { ListCategoriesService } from './use-cases/queries/list-categories/list-categories.service';

describe('CategoriesService', () => {
  const categoryId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b101';
  let createCategory: jest.Mocked<Pick<CreateCategoryService, 'execute'>>;
  let createBatchCategories: jest.Mocked<
    Pick<CreateBatchCategoriesService, 'execute'>
  >;
  let listCategories: jest.Mocked<Pick<ListCategoriesService, 'execute'>>;
  let getCategory: jest.Mocked<Pick<GetCategoryService, 'execute'>>;
  let updateCategory: jest.Mocked<Pick<UpdateCategoryService, 'execute'>>;
  let deleteCategory: jest.Mocked<Pick<DeleteCategoryService, 'execute'>>;
  let syncCategoryChildren: jest.Mocked<
    Pick<SyncCategoryChildrenService, 'execute'>
  >;
  let service: CategoriesService;

  beforeEach(() => {
    createCategory = { execute: jest.fn() };
    createBatchCategories = { execute: jest.fn() };
    listCategories = { execute: jest.fn() };
    getCategory = { execute: jest.fn() };
    updateCategory = { execute: jest.fn() };
    deleteCategory = { execute: jest.fn() };
    syncCategoryChildren = { execute: jest.fn() };
    service = new CategoriesService(
      createCategory as CreateCategoryService,
      createBatchCategories as CreateBatchCategoriesService,
      listCategories as ListCategoriesService,
      getCategory as GetCategoryService,
      updateCategory as UpdateCategoryService,
      deleteCategory as DeleteCategoryService,
      syncCategoryChildren as SyncCategoryChildrenService,
    );
  });

  it('delegates category creation to its command use case', async () => {
    createCategory.execute.mockResolvedValue({ id: categoryId } as never);

    await expect(
      service.createCategory({
        name: 'Category',
        isActive: true,
        visibleInMenu: true,
      }),
    ).resolves.toEqual({ id: categoryId });

    expect(createCategory.execute).toHaveBeenCalledWith({
      name: 'Category',
      isActive: true,
      visibleInMenu: true,
    });
  });

  it('delegates read and write category workflows to action use cases', async () => {
    listCategories.execute.mockResolvedValue({ categories: [] } as never);
    getCategory.execute.mockResolvedValue({ id: categoryId } as never);
    updateCategory.execute.mockResolvedValue({ id: categoryId } as never);
    deleteCategory.execute.mockResolvedValue({
      category: { id: categoryId },
    } as never);

    await service.listCategories({ pageSize: 10 });
    await service.getCategory(categoryId, 'children');
    await service.updateCategory(categoryId, { name: 'Updated' });
    await service.deleteCategory(categoryId);

    expect(listCategories.execute).toHaveBeenCalledWith({ pageSize: 10 });
    expect(getCategory.execute).toHaveBeenCalledWith({
      id: categoryId,
      include: 'children',
    });
    expect(updateCategory.execute).toHaveBeenCalledWith({
      id: categoryId,
      changes: { name: 'Updated' },
    });
    expect(deleteCategory.execute).toHaveBeenCalledWith({ id: categoryId });
  });

  it('delegates batch and children sync workflows to command use cases', async () => {
    createBatchCategories.execute.mockResolvedValue({
      succeeded: [],
      failed: [],
      status: 'success',
    } as never);
    syncCategoryChildren.execute.mockResolvedValue({
      status: 'success',
      created: { succeeded: [], failed: [] },
      updated: { succeeded: [], failed: [] },
      deleted: { succeeded: [], failed: [] },
    } as never);

    await service.createBatchCategories({ categories: [] });
    await service.syncCategoryChildren({
      id: categoryId,
      newCategories: [],
      updateCategories: [],
      deleteCategories: [],
    });

    expect(createBatchCategories.execute).toHaveBeenCalledWith({
      categories: [],
    });
    expect(syncCategoryChildren.execute).toHaveBeenCalledWith({
      id: categoryId,
      newCategories: [],
      updateCategories: [],
      deleteCategories: [],
    });
  });
});
