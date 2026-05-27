import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationService } from '../common/pagination/pagination.service';
import {
  CreateAttributeDto,
  CreateBatchAttributeDto,
} from '@org/contracts';
import { ListAttributesQueryDto } from '@org/contracts';
import { UpdateAttributeDto } from '@org/contracts';
import { CreateBatchAttributesResultDto } from '@org/contracts';
import { ListAttributesResultDto } from '@org/contracts';
import { CategorySummaryDto } from '@org/contracts';
import {
  AttributeRow,
  toAttributeWithCategoriesDto,
} from './mappers/attributes.mapper';

const DEFAULT_PAGE_SIZE = 50;

type AttributeDelegate = {
  create(args: unknown): Promise<AttributeRow>;
  findFirst(args: unknown): Promise<AttributeRow | null>;
  findMany(args: unknown): Promise<AttributeRow[]>;
  update(args: unknown): Promise<AttributeRow>;
  updateMany(args: unknown): Promise<{ count: number }>;
  count(args: unknown): Promise<number>;
};

type CategoryDelegate = {
  findMany(args: unknown): Promise<CategorySummaryDto[]>;
};

type CategoryAttributeDelegate = {
  deleteMany(args: unknown): Promise<unknown>;
  createMany(args: unknown): Promise<unknown>;
};

type AttributeCursorKeys = { displayOrder: number; id: string };

@Injectable()
export class AttributesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationService,
  ) {}

  async createAttribute(input: CreateAttributeDto) {
    const data = this.normalizeCreateInput(input);
    this.validateBackendAttribute(data);
    const categories = await this.validateCategories(data);
    const slug = await this.generateUniqueSlug(data.name);
    const displayOrder = await this.resolveDisplayOrder(data.displayOrder);

    if (displayOrder > 0) {
      await this.shiftDisplayOrders(displayOrder);
    }

    const row = await this.attribute.create({
      data: {
        name: data.name,
        slug,
        description: data.description ?? null,
        displayOrder,
        isActive: data.isActive,
        isFilterable: data.isFilterable,
        isRequired: data.isRequired,
        appliesToAll: data.appliesToAll,
        categoryLinks:
          !data.appliesToAll && categories.length > 0
            ? {
                create: categories.map((category) => ({
                  category: { connect: { id: category.id } },
                })),
              }
            : undefined,
      },
      include: this.attributeInclude,
    });

    return toAttributeWithCategoriesDto(row);
  }

  async createBatchAttributes(input: {
    attributes: CreateBatchAttributeDto[];
  }): Promise<CreateBatchAttributesResultDto> {
    const results = await Promise.all(
      input.attributes.map((attribute) => this.createBatchItem(attribute)),
    );
    const succeeded = results.filter(
      (item): item is { key: string; id: string } => 'id' in item,
    );
    const failed = results.filter(
      (item): item is { key: string; reason: string } => 'reason' in item,
    );

    return {
      succeeded,
      failed,
      status: this.resolveBatchStatus(succeeded.length, failed.length),
    };
  }

  async listAttributes(
    input: ListAttributesQueryDto,
  ): Promise<ListAttributesResultDto> {
    const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;
    if (input.paginationType === 'cursor') {
      return this.listAttributesWithCursor(input, pageSize);
    }
    if (input.paginationType === 'none') {
      return this.listAttributesWithoutPagination(input);
    }

    const window = this.pagination.offsetWindow(input.page, pageSize);
    const where = this.attributeWhere(input);
    const [rows, totalCount] = await Promise.all([
      this.attribute.findMany({
        where,
        include: this.attributeInclude,
        orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
        take: window.pageSize,
        skip: window.offset,
      }),
      this.attribute.count({ where }),
    ]);

    return {
      attributes: rows.map(toAttributeWithCategoriesDto),
      ...this.pagination.offsetMetadata(totalCount, window.pageSize),
    };
  }

  private async listAttributesWithoutPagination(
    input: ListAttributesQueryDto,
  ): Promise<ListAttributesResultDto> {
    const rows = await this.attribute.findMany({
      where: this.attributeWhere(input),
      include: this.attributeInclude,
      orderBy: [{ displayOrder: 'asc' }, { id: 'asc' }],
    });

    return {
      attributes: rows.map(toAttributeWithCategoriesDto),
    };
  }

  private async listAttributesWithCursor(
    input: ListAttributesQueryDto,
    pageSize: number,
  ): Promise<ListAttributesResultDto> {
    const filterHash = this.pagination.fingerprint({
      showDeleted: input.showDeleted ?? false,
      categoryIds: input.categoryIds ?? null,
      exclude: input.exclude ?? null,
      appliesToAll: input.appliesToAll ?? false,
      or: input.or ?? null,
    });
    const cursor = this.pagination.cursorPosition<AttributeCursorKeys>({
      after: input.after,
      before: input.before,
      filterHash,
    });
    const isBackward = cursor?.isBackward ?? false;
    const rows = await this.attribute.findMany({
      where: this.attributeWhere(input, cursor?.keys, isBackward),
      include: this.attributeInclude,
      orderBy: [
        { displayOrder: isBackward ? 'desc' : 'asc' },
        { id: isBackward ? 'desc' : 'asc' },
      ],
      take: pageSize + 1,
      skip: 0,
    });
    const window = this.pagination.cursorWindow(rows, pageSize, isBackward);

    const metadata = this.pagination.cursorMetadataFromRows(window.rows, {
      isBackward,
      hasAnchor: Boolean(cursor),
      hasMore: window.hasMore,
      filterHash,
      getKeys: (row) => ({ displayOrder: row.displayOrder, id: row.id }),
    });

    return {
      attributes: window.rows.map(toAttributeWithCategoriesDto),
      nextCursor: metadata.nextCursor ?? null,
      prevCursor: metadata.prevCursor ?? null,
    };
  }

  private excludesCategoryData(input: ListAttributesQueryDto): boolean {
    return input.exclude?.includes('categoryIds') ?? false;
  }

  private attributeWhere(
    input: ListAttributesQueryDto,
    cursor?: AttributeCursorKeys,
    isBackward = false,
  ) {
    const where: Record<string, unknown> = input.showDeleted
      ? {}
      : { deletedAt: null };
    const orFilters = new Set(input.or ?? []);
    const orConditions: Record<string, unknown>[] = [];

    if (orFilters.has('appliesToAll')) {
      orConditions.push({ appliesToAll: input.appliesToAll ?? false });
    } else {
      where.appliesToAll = input.appliesToAll ?? false;
    }

    if (input.categoryIds && input.categoryIds.length > 0) {
      const categoryFilter = {
        [this.excludesCategoryData(input) ? 'none' : 'some']: {
          categoryId: { in: input.categoryIds },
        },
      };
      if (orFilters.has('categoryIds')) {
        orConditions.push({ categoryLinks: categoryFilter });
      } else {
        where.categoryLinks = categoryFilter;
      }
    }

    if (orConditions.length > 0) {
      where.OR = orConditions;
    }

    if (cursor) {
      const cursorConditions = isBackward
        ? [
            { displayOrder: { lt: cursor.displayOrder } },
            { displayOrder: cursor.displayOrder, id: { lt: cursor.id } },
          ]
        : [
            { displayOrder: { gt: cursor.displayOrder } },
            { displayOrder: cursor.displayOrder, id: { gt: cursor.id } },
          ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: cursorConditions }];
        delete where.OR;
      } else {
        where.OR = cursorConditions;
      }
    }

    return where;
  }

  async getAttribute(id: string) {
    const row = await this.getExistingAttribute(id);
    return {
      attribute: toAttributeWithCategoriesDto(row),
      version: row.version,
    };
  }

  async updateAttribute(
    id: string,
    input: UpdateAttributeDto,
    expectedVersion: number,
  ) {
    const current = await this.getExistingAttribute(id, true);
    if (current.deletedAt) {
      throw new BadRequestException('attribute is already deleted');
    }
    if (current.version !== expectedVersion) {
      throw new BadRequestException(
        'the resource has been modified by another request',
      );
    }

    const merged = this.mergeUpdateInput(current, input);
    this.validateBackendAttribute(merged);
    const categories = await this.validateCategories(merged, input.categoryIds);
    const data = await this.updateData(current, merged, input);

    const updatedCount = await this.attribute.updateMany({
      where: { id, version: expectedVersion, deletedAt: null },
      data,
    });
    if (updatedCount.count === 0) {
      throw new BadRequestException(
        'the resource has been modified by another request',
      );
    }

    if (merged.appliesToAll) {
      await this.replaceCategoryLinks(id, []);
    } else if (input.categoryIds !== undefined) {
      await this.replaceCategoryLinks(
        id,
        categories.map((category) => category.id),
      );
    } else if (current.appliesToAll && !merged.appliesToAll) {
      await this.replaceCategoryLinks(id, []);
    }

    const row = await this.getExistingAttribute(id);
    return {
      attribute: toAttributeWithCategoriesDto(row),
      version: row.version,
    };
  }

  async deleteAttribute(id: string) {
    const current = await this.getExistingAttribute(id, true);
    if (current.deletedAt) {
      throw new BadRequestException('attribute is already deleted');
    }

    await this.attribute.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        version: { increment: 1 },
        updatedAt: new Date(),
      },
      include: this.attributeInclude,
    });

    const row = await this.getExistingAttribute(id, true);
    return toAttributeWithCategoriesDto(row);
  }

  private normalizeCreateInput(input: CreateAttributeDto) {
    return {
      name: input.name,
      description: input.description,
      displayOrder: 0,
      isActive: input.isActive ?? true,
      isFilterable: input.isFilterable ?? false,
      isRequired: input.isRequired ?? false,
      appliesToAll: input.appliesToAll ?? false,
      categoryIds: input.categoryIds ?? [],
    };
  }

  private mergeUpdateInput(current: AttributeRow, input: UpdateAttributeDto) {
    const appliesToAll = input.appliesToAll ?? current.appliesToAll;
    return {
      name: input.name ?? current.name,
      description:
        input.description !== undefined
          ? input.description
          : current.description,
      displayOrder: current.displayOrder,
      isActive: input.isActive ?? current.isActive,
      isFilterable: input.isFilterable ?? current.isFilterable,
      isRequired: input.isRequired ?? current.isRequired,
      appliesToAll,
      categoryIds:
        input.categoryIds ??
        (appliesToAll
          ? []
          : (current.categoryLinks ?? []).map((link) => link.category.id)),
    };
  }

  private async updateData(
    current: AttributeRow,
    merged: ReturnType<AttributesService['mergeUpdateInput']>,
    input: UpdateAttributeDto,
  ) {
    const data: Record<string, unknown> = {
      name: merged.name,
      description: merged.description ?? null,
      displayOrder: merged.displayOrder,
      isActive: merged.isActive,
      isFilterable: merged.isFilterable,
      isRequired: merged.isRequired,
      appliesToAll: merged.appliesToAll,
      version: { increment: 1 },
      updatedAt: new Date(),
    };

    if (input.name !== undefined && input.name !== current.name) {
      data.slug = await this.generateUniqueSlug(input.name, current.id);
    }

    return data;
  }

  private async validateCategories(
    input: { appliesToAll: boolean; categoryIds: string[] },
    explicitCategoryIds = input.categoryIds,
  ) {
    if (input.appliesToAll) {
      return [];
    }
    if (input.categoryIds.length === 0) {
      throw new BadRequestException(
        'at least one category is required when applies_to_all is false',
      );
    }
    if (explicitCategoryIds === undefined || explicitCategoryIds.length === 0) {
      return [];
    }

    const categories = await this.category.findMany({
      where: { id: { in: explicitCategoryIds }, deletedAt: null },
      select: { id: true, name: true, slug: true },
    });
    const found = new Set(categories.map((category) => category.id));
    const failed = explicitCategoryIds.filter((id) => !found.has(id));
    if (failed.length > 0) {
      throw new BadRequestException('Una o más categorías no son válidas');
    }

    const byId = new Map(categories.map((category) => [category.id, category]));
    return explicitCategoryIds.flatMap((id) => {
      const category = byId.get(id);
      return category ? [category] : [];
    });
  }

  private validateBackendAttribute(input: {
    name: string;
    description?: string | null;
    appliesToAll: boolean;
    categoryIds: string[];
  }) {
    const name = input.name.trim();
    if (name.length < 1 || name.length > 100) {
      throw new BadRequestException(
        'validation error: name must be between 1 and 100 characters',
      );
    }
    if (input.description && input.description.length > 300) {
      throw new BadRequestException(
        'validation error: description must be at most 300 characters',
      );
    }
    if (!input.appliesToAll && input.categoryIds.length === 0) {
      throw new BadRequestException(
        'at least one category is required when applies_to_all is false',
      );
    }
  }

  private async getExistingAttribute(
    id: string,
    includeDeleted = false,
  ): Promise<AttributeRow> {
    const attribute = await this.attribute.findFirst({
      where: includeDeleted ? { id } : { id, deletedAt: null },
      include: this.attributeInclude,
    });

    if (!attribute) {
      throw new NotFoundException('attribute not found');
    }

    return attribute;
  }

  private async generateUniqueSlug(value: string, exceptId?: string) {
    const existingName = await this.attribute.findFirst({
      where: {
        name: { equals: value, mode: 'insensitive' },
        deletedAt: null,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      select: { id: true },
    });

    if (existingName) {
      throw new ConflictException('attribute name already exists');
    }

    const slug = this.slugify(value);
    if (!slug) {
      throw new BadRequestException(
        'input cannot be normalized into a valid slug',
      );
    }

    const existingSlug = await this.attribute.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      select: { id: true },
    });

    if (existingSlug) {
      throw new ConflictException('attribute slug already exists');
    }

    return slug;
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async resolveDisplayOrder(displayOrder: number) {
    if (displayOrder > 0) {
      return displayOrder;
    }
    const rows = await this.attribute.findMany({
      where: { deletedAt: null },
      orderBy: [{ displayOrder: 'desc' }],
      take: 1,
    });
    return (rows[0]?.displayOrder ?? 0) + 1;
  }

  private async shiftDisplayOrders(displayOrder: number) {
    await this.attribute.updateMany({
      where: { displayOrder: { gte: displayOrder }, deletedAt: null },
      data: { displayOrder: { increment: 1 } },
    });
  }

  private async replaceCategoryLinks(
    attributeId: string,
    categoryIds: string[],
  ) {
    await this.categoryAttribute.deleteMany({ where: { attributeId } });
    if (categoryIds.length === 0) {
      return;
    }
    await this.categoryAttribute.createMany({
      data: categoryIds.map((categoryId) => ({ attributeId, categoryId })),
      skipDuplicates: true,
    });
  }

  private async createBatchItem(attribute: CreateBatchAttributeDto) {
    try {
      const result = await this.createAttribute(attribute);
      return { key: attribute.key, id: result.id };
    } catch (error) {
      return {
        key: attribute.key,
        reason: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private resolveBatchStatus(successCount: number, failureCount: number) {
    if (failureCount === 0) {
      return 'success' as const;
    }
    if (successCount === 0) {
      return 'failed' as const;
    }
    return 'partial' as const;
  }

  private get attributeInclude() {
    return {
      categoryLinks: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
              deletedAt: true,
            },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    };
  }

  private get attribute(): AttributeDelegate {
    return (this.prisma as unknown as { attribute: AttributeDelegate })
      .attribute;
  }

  private get category(): CategoryDelegate {
    return (this.prisma as unknown as { category: CategoryDelegate })
      .category;
  }

  private get categoryAttribute(): CategoryAttributeDelegate {
    return (
      this.prisma as unknown as {
        categoryAttribute: CategoryAttributeDelegate;
      }
    ).categoryAttribute;
  }
}


