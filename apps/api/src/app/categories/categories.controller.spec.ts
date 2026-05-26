jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let categoriesService: {
    listCategories: jest.Mock;
    createCategory: jest.Mock;
    createBatchCategories: jest.Mock;
    getCategory: jest.Mock;
    updateCategory: jest.Mock;
    deleteCategory: jest.Mock;
    syncCategoryChildren: jest.Mock;
  };

  const category = {
    id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b101',
    name: 'Category',
    slug: 'category',
    isActive: true,
    visibleInMenu: true,
    hasAttributes: true,
    parentId: '018f4dc4-5f51-7c55-9b8f-15fbdd99b102',
    parentName: 'Parent',
    description: 'text',
    imageUrl: 'data:image/png;base64,category',
    metaTitle: 'Meta title',
    metaDescription: 'Meta description',
    createdAt: new Date('2026-04-13T00:00:00.000Z'),
    updatedAt: new Date('2026-04-13T00:00:00.000Z'),
  };

  beforeEach(async () => {
    categoriesService = {
      listCategories: jest.fn(),
      createCategory: jest.fn(),
      createBatchCategories: jest.fn(),
      getCategory: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn(),
      syncCategoryChildren: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: categoriesService,
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('returns raw list data', async () => {
    categoriesService.listCategories.mockResolvedValue({
      categories: [category],
      totalCount: 1,
      totalPages: 1,
    });

    const result = await controller.listCategories({
      pageSize: '10',
      page: '1',
      query: 'Cat',
    } as never);

    expect(categoriesService.listCategories).toHaveBeenCalledWith({
      parentId: undefined,
      pageSize: 10,
      page: 1,
      rootOnly: false,
      query: 'Cat',
      paginationType: undefined,
      after: undefined,
      before: undefined,
    });
    expect(result).toEqual({
      categories: [category],
      totalCount: 1,
      totalPages: 1,
    });
  });

  it('allows cursor pagination without a search query', async () => {
    categoriesService.listCategories.mockResolvedValue({
      categories: [category],
      nextCursor: 'next-cursor-token',
    });

    const result = await controller.listCategories({
      pageSize: '10',
      paginationType: 'cursor',
    } as never);

    expect(categoriesService.listCategories).toHaveBeenCalledWith({
      parentId: undefined,
      pageSize: 10,
      page: undefined,
      rootOnly: false,
      query: undefined,
      paginationType: 'cursor',
      after: undefined,
      before: undefined,
    });
    expect(result).toEqual({
      categories: [category],
      nextCursor: 'next-cursor-token',
    });
  });

  it('normalizes cursor pagination type casing', async () => {
    categoriesService.listCategories.mockResolvedValue({
      categories: [category],
      nextCursor: 'next-cursor-token',
    });

    await controller.listCategories({
      pageSize: '10',
      paginationType: 'Cursor',
    } as never);

    expect(categoriesService.listCategories).toHaveBeenCalledWith(
      expect.objectContaining({
        paginationType: 'cursor',
      }),
    );
  });

  it('allows cursor tokens without a search query', async () => {
    categoriesService.listCategories.mockResolvedValue({
      categories: [category],
      prevCursor: 'prev-cursor-token',
    });

    const result = await controller.listCategories({
      pageSize: '10',
      paginationType: 'cursor',
      after: 'anchor-cursor-token',
    } as never);

    expect(categoriesService.listCategories).toHaveBeenCalledWith({
      parentId: undefined,
      pageSize: 10,
      page: undefined,
      rootOnly: false,
      query: undefined,
      paginationType: 'cursor',
      after: 'anchor-cursor-token',
      before: undefined,
    });
    expect(result).toEqual({
      categories: [category],
      prevCursor: 'prev-cursor-token',
    });
  });

  it('returns raw create data', async () => {
    categoriesService.createCategory.mockResolvedValue(category);

    const result = await controller.createCategory({
      name: 'Category',
      isActive: true,
      visibleInMenu: true,
    });

    expect(result).toEqual(category);
  });

  it('returns raw batch data', async () => {
    categoriesService.createBatchCategories.mockResolvedValue({
      succeeded: [{ key: 'tmp-1', id: category.id }],
      failed: [],
      status: 'success',
    });

    const result = await controller.createBatchCategories({
      categories: [
        {
          key: 'tmp-1',
          name: 'Category',
          isActive: true,
          visibleInMenu: true,
        },
      ],
    });

    expect(result).toEqual({
      succeeded: [{ key: 'tmp-1', id: category.id }],
      failed: [],
      status: 'success',
    });
  });

  it('returns children only for include=children', async () => {
    categoriesService.getCategory.mockResolvedValue({
      ...category,
      children: [],
    });

    const result = await controller.getCategory(
      { id: category.id },
      { include: 'children' },
    );

    expect(categoriesService.getCategory).toHaveBeenCalledWith(
      category.id,
      'children',
    );
    expect(result).toEqual({
      ...category,
      children: [],
    });
  });

  it('returns deleted category wrapped in category property', async () => {
    categoriesService.deleteCategory.mockResolvedValue({ category });

    const result = await controller.deleteCategory({ id: category.id });

    expect(result).toEqual({ category });
  });

  it('returns sync children snapshot envelope', async () => {
    categoriesService.syncCategoryChildren.mockResolvedValue({
      status: 'success',
      created: { succeeded: [{ key: 'tmp-1', id: category.id }], failed: [] },
      updated: { succeeded: [{ id: category.id }], failed: [] },
      deleted: { succeeded: [{ id: category.id }], failed: [] },
    });

    const result = await controller.syncCategoryChildren(
      { id: category.id },
      {
        newCategories: [
          {
            key: 'tmp-1',
            name: 'Child',
            isActive: true,
            visibleInMenu: true,
          },
        ],
        updateCategories: [],
        deleteCategories: [],
      },
    );

    expect(result).toEqual({
      status: 'success',
      created: {
        succeeded: [{ key: 'tmp-1', id: category.id }],
        failed: [],
      },
      updated: {
        succeeded: [{ id: category.id }],
        failed: [],
      },
      deleted: {
        succeeded: [{ id: category.id }],
        failed: [],
      },
    });
  });
});
