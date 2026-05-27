jest.mock('../prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { Test, TestingModule } from '@nestjs/testing';
import { AttributesController } from './attributes.controller';
import { AttributesService } from './attributes.service';

describe('AttributesController', () => {
  let controller: AttributesController;
  let attributesService: {
    listAttributes: jest.Mock;
    createAttribute: jest.Mock;
    createBatchAttributes: jest.Mock;
    getAttribute: jest.Mock;
    updateAttribute: jest.Mock;
    deleteAttribute: jest.Mock;
  };

  const categoryId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b102';
  const attribute = {
    id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b101',
    name: 'Color',
    slug: 'color',
    description: 'text',
    displayOrder: 1,
    isActive: true,
    isFilterable: false,
    appliesToAll: false,
    isRequired: false,
    categoryIds: [categoryId],
    createdAt: new Date('2026-04-13T00:00:00.000Z'),
    updatedAt: new Date('2026-04-13T00:00:00.000Z'),
    categories: [{ id: categoryId, name: 'Category', slug: 'category' }],
  };

  beforeEach(async () => {
    attributesService = {
      listAttributes: jest.fn(),
      createAttribute: jest.fn(),
      createBatchAttributes: jest.fn(),
      getAttribute: jest.fn(),
      updateAttribute: jest.fn(),
      deleteAttribute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttributesController],
      providers: [
        {
          provide: AttributesService,
          useValue: attributesService,
        },
      ],
    }).compile();

    controller = module.get<AttributesController>(AttributesController);
  });

  it('returns the legacy list envelope', async () => {
    attributesService.listAttributes.mockResolvedValue({
      attributes: [attribute],
      totalCount: 1,
      totalPages: 1,
    });

    const result = await controller.listAttributes({
      pageSize: '10',
      page: '1',
    });

    expect(attributesService.listAttributes).toHaveBeenCalledWith({
      showDeleted: false,
      pageSize: 10,
      page: 1,
      paginationType: undefined,
      after: undefined,
      before: undefined,
      categoryIds: undefined,
      exclude: undefined,
      appliesToAll: false,
      or: undefined,
    });
    expect(result).toEqual({
      success: true,
      message: 'Attributes retrieved successfully',
      data: {
        attributes: [attribute],
        totalCount: 1,
        totalPages: 1,
      },
    });
  });

  it('passes category id filters to the attributes service', async () => {
    const nextCategoryId = '018f4dc4-5f51-7c55-9b8f-15fbdd99b103';
    attributesService.listAttributes.mockResolvedValue({
      attributes: [attribute],
      totalCount: 1,
      totalPages: 1,
    });

    await controller.listAttributes({
      pageSize: '10',
      categoryIds: [categoryId, nextCategoryId],
    });

    expect(attributesService.listAttributes).toHaveBeenCalledWith({
      showDeleted: false,
      pageSize: 10,
      page: 1,
      paginationType: undefined,
      after: undefined,
      before: undefined,
      categoryIds: [categoryId, nextCategoryId],
      exclude: undefined,
      appliesToAll: false,
      or: undefined,
    });
  });

  it('passes OR filter names to the attributes service', async () => {
    attributesService.listAttributes.mockResolvedValue({
      attributes: [attribute],
      totalCount: 1,
      totalPages: 1,
    });

    await controller.listAttributes({
      pageSize: '10',
      categoryIds: categoryId,
      appliesToAll: 'true',
      or: 'categoryIds,appliesToAll',
    } as never);

    expect(attributesService.listAttributes).toHaveBeenCalledWith({
      showDeleted: false,
      pageSize: 10,
      page: 1,
      paginationType: undefined,
      after: undefined,
      before: undefined,
      categoryIds: [categoryId],
      exclude: undefined,
      appliesToAll: true,
      or: ['categoryIds', 'appliesToAll'],
    });
  });

  it('normalizes categoryId query aliases for category and OR filters', async () => {
    attributesService.listAttributes.mockResolvedValue({
      attributes: [attribute],
      totalCount: 1,
      totalPages: 1,
    });

    await controller.listAttributes({
      pageSize: '10',
      categoryId,
      appliesToAll: 'true',
      or: 'categoryId,appliesToAll',
    } as never);

    expect(attributesService.listAttributes).toHaveBeenCalledWith({
      showDeleted: false,
      pageSize: 10,
      page: 1,
      paginationType: undefined,
      after: undefined,
      before: undefined,
      categoryIds: [categoryId],
      exclude: undefined,
      appliesToAll: true,
      or: ['categoryIds', 'appliesToAll'],
    });
  });

  it('passes appliesToAll filters to the attributes service', async () => {
    attributesService.listAttributes.mockResolvedValue({
      attributes: [attribute],
      totalCount: 1,
      totalPages: 1,
    });

    await controller.listAttributes({
      pageSize: '10',
      appliesToAll: 'true',
    });

    expect(attributesService.listAttributes).toHaveBeenCalledWith({
      showDeleted: false,
      pageSize: 10,
      page: 1,
      paginationType: undefined,
      after: undefined,
      before: undefined,
      categoryIds: undefined,
      exclude: undefined,
      appliesToAll: true,
      or: undefined,
    });
  });

  it('passes explicit appliesToAll=false filters to the attributes service', async () => {
    attributesService.listAttributes.mockResolvedValue({
      attributes: [attribute],
      totalCount: 1,
      totalPages: 1,
    });

    await controller.listAttributes({
      pageSize: '10',
      appliesToAll: 'false',
    });

    expect(attributesService.listAttributes).toHaveBeenCalledWith({
      showDeleted: false,
      pageSize: 10,
      page: 1,
      paginationType: undefined,
      after: undefined,
      before: undefined,
      categoryIds: undefined,
      exclude: undefined,
      appliesToAll: false,
      or: undefined,
    });
  });

  it('passes excluded category filters to the attributes service', async () => {
    attributesService.listAttributes.mockResolvedValue({
      attributes: [attribute],
      totalCount: 1,
      totalPages: 1,
    });

    await controller.listAttributes({
      pageSize: '10',
      exclude: 'categoryIds',
    });

    expect(attributesService.listAttributes).toHaveBeenCalledWith({
      showDeleted: false,
      pageSize: 10,
      page: 1,
      paginationType: undefined,
      after: undefined,
      before: undefined,
      categoryIds: undefined,
      exclude: ['categoryIds'],
      appliesToAll: false,
      or: undefined,
    });
  });

  it('passes category filters without pagination when paginationType is none', async () => {
    attributesService.listAttributes.mockResolvedValue({
      attributes: [attribute],
    });

    const result = await controller.listAttributes({
      paginationType: 'None',
      categoryIds: categoryId,
    } as never);

    expect(attributesService.listAttributes).toHaveBeenCalledWith({
      showDeleted: false,
      pageSize: undefined,
      page: undefined,
      paginationType: 'none',
      after: undefined,
      before: undefined,
      categoryIds: [categoryId],
      exclude: undefined,
      appliesToAll: false,
      or: undefined,
    });
    expect(result).toEqual({
      success: true,
      message: 'Attributes retrieved successfully',
      data: {
        attributes: [attribute],
      },
    });
  });

  it('returns the legacy list envelope with flat cursor metadata', async () => {
    attributesService.listAttributes.mockResolvedValue({
      attributes: [attribute],
      nextCursor: 'next-cursor-token',
      prevCursor: 'prev-cursor-token',
    });

    const result = await controller.listAttributes({
      pageSize: '10',
      paginationType: 'Cursor',
      after: 'anchor-cursor-token',
    } as never);

    expect(attributesService.listAttributes).toHaveBeenCalledWith({
      showDeleted: false,
      pageSize: 10,
      page: undefined,
      paginationType: 'cursor',
      after: 'anchor-cursor-token',
      before: undefined,
      categoryIds: undefined,
      exclude: undefined,
      appliesToAll: false,
      or: undefined,
    });
    expect(result).toEqual({
      success: true,
      message: 'Attributes retrieved successfully',
      data: {
        attributes: [attribute],
        nextCursor: 'next-cursor-token',
        prevCursor: 'prev-cursor-token',
      },
    });
  });

  it('returns the create snapshot envelope', async () => {
    attributesService.createAttribute.mockResolvedValue(attribute);

    const result = await controller.createAttribute({
      name: 'Color',
      categoryIds: [categoryId],
    });

    expect(attributesService.createAttribute).toHaveBeenCalledWith({
      name: 'Color',
      categoryIds: [categoryId],
      isActive: true,
      isFilterable: false,
      appliesToAll: false,
      isRequired: false,
    });
    expect(result).toEqual({
      success: true,
      message: 'Attribute created successfully',
      data: attribute,
    });
  });

  it('returns the batch snapshot envelope', async () => {
    attributesService.createBatchAttributes.mockResolvedValue({
      succeeded: [{ key: 'tmp-1', id: attribute.id }],
      failed: [],
      status: 'success',
    });

    const result = await controller.createBatchAttributes({
      attributes: [
        {
          key: 'tmp-1',
          name: 'Color',
          categoryIds: [categoryId],
        },
      ],
    });

    expect(result).toEqual({
      success: true,
      message: 'Batch attributes created successfully',
      data: {
        succeeded: [{ key: 'tmp-1', id: attribute.id }],
        failed: [],
        status: 'success',
      },
    });
  });

  it('sets ETag when returning an attribute', async () => {
    attributesService.getAttribute.mockResolvedValue({
      attribute,
      version: 3,
    });
    const response = { setHeader: jest.fn() };

    const result = await controller.getAttribute(
      { id: attribute.id },
      response as never,
    );

    expect(response.setHeader).toHaveBeenCalledWith('ETag', '"3"');
    expect(result).toEqual({
      success: true,
      message: 'Attribute retrieved successfully',
      data: attribute,
    });
  });

  it('passes If-Match version and returns refreshed ETag on update', async () => {
    attributesService.updateAttribute.mockResolvedValue({
      attribute: { ...attribute, name: 'Size' },
      version: 4,
    });
    const response = { setHeader: jest.fn() };

    const result = await controller.updateAttribute(
      { id: attribute.id },
      { name: 'Size' },
      '"3"',
      response as never,
    );

    expect(attributesService.updateAttribute).toHaveBeenCalledWith(
      attribute.id,
      { name: 'Size' },
      3,
    );
    expect(response.setHeader).toHaveBeenCalledWith('ETag', '"4"');
    expect(result).toEqual({
      success: true,
      message: 'Attribute updated successfully',
      data: { ...attribute, name: 'Size' },
    });
  });

  it('returns the delete snapshot envelope', async () => {
    attributesService.deleteAttribute.mockResolvedValue(attribute);

    const result = await controller.deleteAttribute({ id: attribute.id });

    expect(result).toEqual({
      success: true,
      message: 'Attribute deleted successfully',
      data: attribute,
    });
  });
});
