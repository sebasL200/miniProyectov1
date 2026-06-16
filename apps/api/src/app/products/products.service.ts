import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PaginationService } from '../common/pagination/pagination.service';
import {
  CreateBatchProductDto,
  CreateProductDto,
} from '@org/contracts';
import { ListProductsQueryDto } from '@org/contracts';
import {
  ToggleProductFeaturedDto,
  ToggleProductStatusDto,
} from '@org/contracts';
import { UpdateProductDto } from '@org/contracts';
import { ListProductsResultDto } from '@org/contracts';
import { CreateBatchProductsResultDto } from '@org/contracts';
import { ProductDto } from '@org/contracts';
import { ProductDimensionsDto } from '@org/contracts';
import type { AttributeSummaryDto } from '@org/contracts';
import { isUuid } from '@org/validations';
import {
  ProductRow,
  toProductDimensionsDto,
  toProductDto,
} from './mappers/products.mapper';
import {
  assertProductReferenceIds,
  parseProductDimensions,
} from './validations/products.validation';

function productAttributeSummarySelect() {
  return { id: true, name: true, slug: true, isRequired: true };
}

function buildProductInclude() {
  return {
    brand: {
      select: {
        id: true,
        name: true,
        slug: true,
      },
    },
    categories: {
      where: { category: { deletedAt: null } },
      select: {
        categoryId: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            attributes: {
              where: {
                attribute: {
                  deletedAt: null,
                  isActive: true,
                },
              },
              select: {
                attribute: {
                  select: productAttributeSummarySelect(),
                },
              },
            },
          },
        },
      },
    },
    variants: {
      where: { deletedAt: null },
      select: {
        id: true,
        sku: true,
      },
    },
    attributeLinks: {
      where: {
        attribute: {
          deletedAt: null,
          isActive: true,
        },
      },
      select: {
        attribute: {
          select: productAttributeSummarySelect(),
        },
      },
    },
  } as const;
}

const PRODUCT_INCLUDE = buildProductInclude();

type ProductCursorKeys = { name: string; id: string };
type ProductWithRelations = ProductRow & {
  brand?: { id: string; name: string; slug: string } | null;
  categories: Array<{
    categoryId: string;
    category: {
      id: string;
      name: string;
      slug: string;
      attributes: Array<{
        attribute: AttributeSummaryDto;
      }>;
    };
  }>;
  variants: Array<{ id: string; sku: string }>;
  attributeLinks: Array<{
    attribute: AttributeSummaryDto;
  }>;
};

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationService,
  ) {}

  async createProduct(
    input: CreateProductDto,
  ): Promise<{ product: ProductDto }> {
    this.validateBackendProduct(input);
    assertProductReferenceIds(input);

    const dimensionsBase = this.normalizeProductDimensions(
      input.dimensionsBase,
    );
    const directAttributeIds = this.normalizeAttributeIds(input.attributeIds);
    await this.ensureActiveAttributesExist(directAttributeIds);

    const slug = await this.generateUniqueSlug(input.name);

    try {
      const row = (await this.prisma.product.create({
        data: {
          brandId: input.brandId ?? null,
          name: input.name.trim(),
          slug,
          specificationsHtml: input.specificationsHtml ?? null,
          shortDescription: input.descriptionShort ?? '',
          descriptionHtml: input.descriptionHtml,
          isActive: input.isActive,
          basePrice: input.basePrice,
          skuBase: input.modelYear,
          isFeatured: input.isFeatured,
          dimensionsWeight: dimensionsBase as Prisma.InputJsonValue,
          metaTitle: input.name.trim(),
          metaDescription: input.descriptionShort ?? null,
          categories: {
            createMany: {
              data: input.categoriesId.map((categoryId) => ({ categoryId })),
            },
          },
          ...(directAttributeIds.length > 0
            ? {
                attributeLinks: {
                  createMany: {
                    data: directAttributeIds.map((attributeId) => ({
                      attributeId,
                    })),
                  },
                },
              }
            : {}),
        },
        include: PRODUCT_INCLUDE,
      })) as unknown as ProductWithRelations;

      return { product: await this.mapProduct(row) };
    } catch (error) {
      throw this.mapPersistenceError(error);
    }
  }

  async createBatchProducts(input: {
    products: CreateBatchProductDto[];
  }): Promise<CreateBatchProductsResultDto> {
    const results = await Promise.all(
      input.products.map((product) => this.createBatchItem(product)),
    );
    const succeeded = results.filter(
      (item): item is { key: string; id: string } => 'id' in item,
    );
    const failed = results.filter(
      (item): item is { key: string; reason: string } => 'reason' in item,
    );

    const status: CreateBatchProductsResultDto['status'] =
      failed.length === 0
        ? 'success'
        : succeeded.length === 0
          ? 'failed'
          : 'partial';

    return { status, succeeded, failed };
  }

  async listProducts(
    input: ListProductsQueryDto,
  ): Promise<ListProductsResultDto> {
    if (input.paginationType === 'cursor') {
      return this.listProductsWithCursor(input);
    }

    const pageSize = input.pageSize as number;
    const window = this.pagination.offsetWindow(input.page, pageSize);
    const where = this.productsListWhere(input.query);

    try {
      const [rows, totalCount] = await Promise.all([
        this.prisma.product.findMany({
          where,
          include: PRODUCT_INCLUDE,
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
          take: window.pageSize,
          skip: window.offset,
        }),
        this.prisma.product.count({ where }),
      ]);

      const metadata = this.pagination.offsetMetadata(
        totalCount,
        window.pageSize,
      );
      const products = await this.mapProducts(rows as unknown as ProductWithRelations[]);

      return {
        products,
        ...metadata,
      };
    } catch (error) {
      throw this.mapPersistenceError(error);
    }
  }

  async getProduct(id: string): Promise<{ product: ProductDto }> {
    const row = await this.getExistingProduct(id);
    return { product: await this.mapProduct(row) };
  }

  async getProductBySlug(slug: string): Promise<{ product: ProductDto }> {
    try {
      const row = (await this.prisma.product.findFirst({
        where: { slug, deletedAt: null },
        include: PRODUCT_INCLUDE,
      })) as ProductWithRelations | null;

      if (!row) {
        throw new NotFoundException('products not found');
      }

      return { product: await this.mapProduct(row) };
    } catch (error) {
      throw this.mapPersistenceError(error);
    }
  }

  async listProductsByCategory(
    categoryId: string,
    input: ListProductsQueryDto,
  ): Promise<ListProductsResultDto> {
    if (!isUuid(categoryId)) {
      throw new NotFoundException('products not found');
    }

    if (input.paginationType === 'cursor') {
      return this.listProductsByCategoryWithCursor(categoryId, input);
    }

    const pageSize = input.pageSize as number;
    const window = this.pagination.offsetWindow(input.page, pageSize);
    const where = this.productsByCategoryWhere(categoryId);

    try {
      const [rows, totalCount] = await Promise.all([
        this.prisma.product.findMany({
          where,
          include: PRODUCT_INCLUDE,
          orderBy: [{ name: 'asc' }, { id: 'asc' }],
          take: window.pageSize,
          skip: window.offset,
        }),
        this.prisma.product.count({ where }),
      ]);

      const metadata = this.pagination.offsetMetadata(
        totalCount,
        window.pageSize,
      );
      const products = await this.mapProducts(rows as unknown as ProductWithRelations[]);

      return {
        products,
        ...metadata,
      };
    } catch (error) {
      throw this.mapPersistenceError(error);
    }
  }

  async updateProduct(
    id: string,
    input: UpdateProductDto,
  ): Promise<{ product: ProductDto }> {
    const current = await this.getExistingProduct(id);
    const merged = {
      name: input.name ?? current.name,
      modelYear: input.modelYear ?? current.skuBase ?? '',
      descriptionHtml: input.descriptionHtml ?? current.descriptionHtml,
      descriptionShort: input.descriptionShort ?? current.shortDescription,
      specificationsHtml:
        input.specificationsHtml ?? current.specificationsHtml ?? undefined,
      basePrice: this.toNumber(input.basePrice ?? current.basePrice),
      isActive: input.isActive ?? current.isActive,
      isFeatured: input.isFeatured ?? current.isFeatured,
      dimensionsBase:
        input.dimensionsBase !== undefined
          ? this.normalizeProductDimensions(input.dimensionsBase)
          : toProductDimensionsDto(current.dimensionsWeight),
      categoriesId:
        input.categoriesId ??
        current.categories.map((category) => category.categoryId),
      attributeIds:
        input.attributeIds ??
        current.attributeLinks.map((link) => link.attribute.id),
      brandId:
        input.brandId !== undefined
          ? input.brandId
          : (current.brand?.id ?? undefined),
    };

    this.validateBackendProduct(merged);
    assertProductReferenceIds(merged);

    const directAttributeIds = this.normalizeAttributeIds(merged.attributeIds);
    await this.ensureActiveAttributesExist(directAttributeIds);

    const nextEffectiveAttributes = await this.buildEffectiveAttributes(
      merged.categoriesId,
      directAttributeIds,
    );
    await this.ensureVariantsCoverAttributes(id, nextEffectiveAttributes);

    const data: Record<string, unknown> = {
      brandId: merged.brandId ?? null,
      name: merged.name.trim(),
      specificationsHtml: merged.specificationsHtml ?? null,
      shortDescription: merged.descriptionShort ?? '',
      descriptionHtml: merged.descriptionHtml,
      isActive: merged.isActive,
      basePrice: merged.basePrice,
      skuBase: merged.modelYear,
      isFeatured: merged.isFeatured,
      dimensionsWeight: merged.dimensionsBase ?? {},
      metaTitle: merged.name.trim(),
      metaDescription: merged.descriptionShort ?? null,
    };

    if (input.name !== undefined && input.name !== current.name) {
      data.slug = await this.generateUniqueSlug(input.name, id);
    }

    try {
      const row = (await this.prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id },
          data,
        });

        if (input.categoriesId !== undefined) {
          await tx.productCategory.deleteMany({
            where: {
              productId: id,
              ...(input.categoriesId.length > 0
                ? { categoryId: { notIn: input.categoriesId } }
                : {}),
            },
          });

          if (input.categoriesId.length === 0) {
            await tx.productCategory.deleteMany({ where: { productId: id } });
          } else {
            await tx.productCategory.createMany({
              data: input.categoriesId.map((categoryId) => ({
                productId: id,
                categoryId,
              })),
              skipDuplicates: true,
            });
          }
        }

        if (input.attributeIds !== undefined) {
          await tx.productAttribute.deleteMany({ where: { productId: id } });
          if (directAttributeIds.length > 0) {
            await tx.productAttribute.createMany({
              data: directAttributeIds.map((attributeId: string) => ({
                productId: id,
                attributeId,
              })),
              skipDuplicates: true,
            });
          }
        }

        return tx.product.findUniqueOrThrow({
          where: { id },
          include: PRODUCT_INCLUDE,
        });
      })) as ProductWithRelations;

      return { product: await this.mapProduct(row) };
    } catch (error) {
      throw this.mapPersistenceError(error);
    }
  }

  async toggleStatus(
    input: ToggleProductStatusDto,
  ): Promise<{ success: true }> {
    const current = await this.getExistingProduct(input.id);

    if (current.isActive === input.isActive) {
      return { success: true };
    }

    await this.updateProduct(input.id, { isActive: input.isActive });
    return { success: true };
  }

  async toggleFeatured(
    input: ToggleProductFeaturedDto,
  ): Promise<{ success: true }> {
    const current = await this.getExistingProduct(input.id);

    if (current.isFeatured === input.isFeatured) {
      return { success: true };
    }

    await this.updateProduct(input.id, { isFeatured: input.isFeatured });
    return { success: true };
  }

  async deleteProduct(id: string): Promise<{ product: ProductDto }> {
    const current = await this.getExistingProduct(id);

    try {
      const row = await this.prisma.product.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
          isFeatured: false,
        },
      });

      return {
        product: toProductDto(
          {
            ...current,
            ...row,
            categories: current.categories,
            variants: [],
          },
          {
            directAttributes: current.attributeLinks.map((link) => link.attribute),
            attributes: [],
          },
        ),
      };
    } catch (error) {
      if (current) {
        throw this.mapPersistenceError(error);
      }
      throw error;
    }
  }

  private async listProductsWithCursor(
    input: ListProductsQueryDto,
  ): Promise<ListProductsResultDto> {
    const pageSize = input.pageSize as number;
    const filterHash = this.pagination.fingerprint({
      scope: 'products',
      query: input.query?.trim() ?? '',
    });
    const where = this.productsListWhere(input.query);
    const position = this.pagination.cursorPosition<ProductCursorKeys>({
      after: input.after,
      before: input.before,
      filterHash,
    });
    const isBackward = position?.isBackward ?? false;

    const rows = (await this.prisma.product.findMany({
      where: this.applyCursor(where, position),
      include: PRODUCT_INCLUDE,
      orderBy: isBackward
        ? [{ name: 'desc' }, { id: 'desc' }]
        : [{ name: 'asc' }, { id: 'asc' }],
      take: pageSize + 1,
    })) as unknown as ProductWithRelations[];

    const window = this.pagination.cursorWindow(rows, pageSize, isBackward);
    const products = await this.mapProducts(
      window.rows as ProductWithRelations[],
    );

    return {
      products,
      ...this.pagination.cursorMetadataFromRows(window.rows, {
        isBackward,
        hasAnchor: Boolean(position),
        hasMore: window.hasMore,
        filterHash,
        getKeys: (row) => ({
          name: (row as ProductWithRelations).name,
          id: (row as ProductWithRelations).id,
        }),
      }),
    };
  }

  private async createBatchItem(product: CreateBatchProductDto) {
    try {
      const result = await this.createProduct(product);
      return { key: product.key, id: result.product.id };
    } catch (error) {
      return {
        key: product.key,
        reason: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async listProductsByCategoryWithCursor(
    categoryId: string,
    input: ListProductsQueryDto,
  ): Promise<ListProductsResultDto> {
    const pageSize = input.pageSize as number;
    const filterHash = this.pagination.fingerprint({
      scope: 'products_by_category',
      categoryId,
    });
    const position = this.pagination.cursorPosition<ProductCursorKeys>({
      after: input.after,
      before: input.before,
      filterHash,
    });
    const isBackward = position?.isBackward ?? false;

    const rows = (await this.prisma.product.findMany({
      where: this.applyCursor(
        this.productsByCategoryWhere(categoryId),
        position,
      ),
      include: PRODUCT_INCLUDE,
      orderBy: isBackward
        ? [{ name: 'desc' }, { id: 'desc' }]
        : [{ name: 'asc' }, { id: 'asc' }],
      take: pageSize + 1,
    })) as unknown as ProductWithRelations[];

    const window = this.pagination.cursorWindow(rows, pageSize, isBackward);
    const products = await this.mapProducts(
      window.rows as ProductWithRelations[],
    );

    return {
      products,
      ...this.pagination.cursorMetadataFromRows(window.rows, {
        isBackward,
        hasAnchor: Boolean(position),
        hasMore: window.hasMore,
        filterHash,
        getKeys: (row) => ({
          name: (row as ProductWithRelations).name,
          id: (row as ProductWithRelations).id,
        }),
      }),
    };
  }

  private applyCursor(
    where: Record<string, unknown>,
    position: { keys: ProductCursorKeys; isBackward: boolean } | null,
  ): Record<string, unknown> {
    if (!position) {
      return where;
    }

    const comparison = position.isBackward ? 'lt' : 'gt';

    return {
      AND: [
        where,
        {
          OR: [
            { name: { [comparison]: position.keys.name } },
            {
              name: position.keys.name,
              id: { [comparison]: position.keys.id },
            },
          ],
        },
      ],
    };
  }

  private productsByCategoryWhere(categoryId: string): Record<string, unknown> {
    return {
      deletedAt: null,
      categories: {
        some: {
          categoryId,
          category: {
            deletedAt: null,
          },
        },
      },
    };
  }

  private productsListWhere(query?: string | null): Record<string, unknown> {
    const trimmedQuery = query?.trim();

    if (!trimmedQuery) {
      return { deletedAt: null };
    }

    return {
      deletedAt: null,
      OR: [
        { name: { contains: trimmedQuery, mode: 'insensitive' } },
        { slug: { contains: trimmedQuery, mode: 'insensitive' } },
        { skuBase: { contains: trimmedQuery, mode: 'insensitive' } },
      ],
    };
  }

  private async getExistingProduct(id: string): Promise<ProductWithRelations> {
    if (!isUuid(id)) {
      throw new NotFoundException('products not found');
    }

    try {
      const row = (await this.prisma.product.findFirst({
        where: { id, deletedAt: null },
        include: PRODUCT_INCLUDE,
      })) as ProductWithRelations | null;

      if (!row) {
        throw new NotFoundException('products not found');
      }

      return row;
    } catch (error) {
      throw this.mapPersistenceError(error);
    }
  }

  private async mapProducts(
    rows: ProductWithRelations[],
  ): Promise<ProductDto[]> {
    const globalAttributes = await this.loadGlobalAttributes();
    return rows.map((row) => this.toProductResponse(row, globalAttributes));
  }

  private async mapProduct(row: ProductWithRelations): Promise<ProductDto> {
    const globalAttributes = await this.loadGlobalAttributes();
    return this.toProductResponse(row, globalAttributes);
  }

  private toProductResponse(
    row: ProductWithRelations,
    globalAttributes: AttributeSummaryDto[],
  ): ProductDto {
    const inheritedCategoryAttributes = row.categories.flatMap((cat) =>
      (cat.category.attributes ?? []).map((link) => link.attribute),
    );
    const directAttributes = row.attributeLinks.map(
      (link) => link.attribute,
    );
    const attributes = this.uniqueAttributes(
      globalAttributes,
      inheritedCategoryAttributes,
      directAttributes,
    );

    return toProductDto(row, {
      directAttributes,
      attributes,
    });
  }

  private async buildEffectiveAttributes(
    categoryIds: string[],
    directAttributeIds: string[],
  ): Promise<AttributeSummaryDto[]> {
    const globalAttributes = await this.loadGlobalAttributes();
    const categoryAttributes = await this.loadCategoryAttributes(categoryIds);
    const directAttributes = await this.loadAttributesByIds(directAttributeIds);
    return this.uniqueAttributes(globalAttributes, categoryAttributes, directAttributes);
  }

  private async loadGlobalAttributes(): Promise<AttributeSummaryDto[]> {
    const rows = await this.prisma.attribute.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        appliesToAll: true,
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }, { id: 'asc' }],
      select: productAttributeSummarySelect(),
    });
    return rows;
  }

  private async loadCategoryAttributes(
    categoryIds: string[],
  ): Promise<AttributeSummaryDto[]> {
    if (categoryIds.length === 0) {
      return [];
    }
    const rows = await this.prisma.categoryAttribute.findMany({
      where: {
        categoryId: { in: categoryIds },
        attribute: { deletedAt: null, isActive: true },
      },
      select: {
        attribute: {
          select: productAttributeSummarySelect(),
        },
      },
    });
    return rows.map((row) => row.attribute);
  }

  private async loadAttributesByIds(
    attributeIds: string[],
  ): Promise<AttributeSummaryDto[]> {
    if (attributeIds.length === 0) {
      return [];
    }
    const rows = await this.prisma.attribute.findMany({
      where: {
        id: { in: attributeIds },
        deletedAt: null,
        isActive: true,
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }, { id: 'asc' }],
      select: productAttributeSummarySelect(),
    });
    return rows;
  }

  private async ensureActiveAttributesExist(attributeIds: string[]) {
    if (attributeIds.length === 0) {
      return;
    }
    const rows = await this.loadAttributesByIds(attributeIds);
    if (rows.length !== attributeIds.length) {
      throw new BadRequestException(
        'validation error: attribute_ids must contain active attribute UUIDs',
      );
    }
  }

  private async ensureVariantsCoverAttributes(
    productId: string,
    effectiveAttributes: AttributeSummaryDto[],
  ) {
    if (effectiveAttributes.length === 0) {
      return;
    }
    const variants = await this.prisma.variant.findMany({
      where: { productId, deletedAt: null },
      select: {
        id: true,
        attributeValues: {
          select: { attributeId: true },
        },
      },
    });

    const requiredAttributeIds = effectiveAttributes
      .filter((attr) => attr.isRequired)
      .map((attr) => attr.id);

    for (const variant of variants) {
      const variantAttrIds = new Set(
        variant.attributeValues.map((val) => val.attributeId),
      );
      const missing = requiredAttributeIds.filter((id) => !variantAttrIds.has(id));
      if (missing.length > 0) {
        console.warn(
          `Advisory: Variant ${variant.id} of Product ${productId} is missing required attributes: ${missing.join(', ')}`,
        );
      }
    }
  }

  private uniqueAttributes(
    ...groups: Array<AttributeSummaryDto[]>
  ): AttributeSummaryDto[] {
    const seen = new Map<string, AttributeSummaryDto>();

    for (const group of groups) {
      for (const attribute of group) {
        if (!seen.has(attribute.id)) {
          seen.set(attribute.id, attribute);
        }
      }
    }

    return [...seen.values()];
  }

  private normalizeAttributeIds(attributeIds?: string[]): string[] {
    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const attributeId of attributeIds ?? []) {
      const value = attributeId.trim();
      if (value === '') {
        throw new BadRequestException(
          'validation error: attribute_id is required',
        );
      }

      if (!isUuid(value)) {
        throw new BadRequestException(
          'validation error: attribute_ids must contain valid UUIDs',
        );
      }

      if (seen.has(value)) {
        continue;
      }

      seen.add(value);
      normalized.push(value);
    }

    return normalized;
  }

  private normalizeProductDimensions(
    value?: ProductDimensionsDto,
  ): ProductDimensionsDto {
    const issues: string[] = [];
    const dimensions = parseProductDimensions(value, issues);

    if (issues.length > 0) {
      throw new BadRequestException(`validation error: ${issues.join('; ')}`);
    }

    return dimensions ?? {};
  }

  private validateBackendProduct(input: {
    brandId?: string | null;
    name: string;
    descriptionHtml: string;
    descriptionShort?: string;
    categoriesId?: string[];
    basePrice: number;
  }) {
    if (
      input.brandId !== undefined &&
      input.brandId !== null &&
      input.brandId.trim() === ''
    ) {
      throw new BadRequestException(
        'validation error: brand_id cannot be blank',
      );
    }

    const name = input.name.trim();
    if (name.length < 3 || name.length > 100) {
      throw new BadRequestException(
        'validation error: name must be between 3 and 100 characters',
      );
    }

    if (input.descriptionHtml === undefined || input.descriptionHtml === null) {
      throw new BadRequestException(
        'validation error: description is obligatory',
      );
    }

    if (
      input.descriptionShort !== undefined &&
      input.descriptionShort.length > 300
    ) {
      throw new BadRequestException(
        'validation error: description must be at most 300 characters',
      );
    }

    if (!input.categoriesId || input.categoriesId.length === 0) {
      throw new BadRequestException(
        'validation error: at least 1 category must be selected',
      );
    }

    if (input.basePrice < 0) {
      throw new BadRequestException(
        'validation error: base_price must be greater than 0',
      );
    }
  }

  private async generateUniqueSlug(
    value: string,
    exceptId?: string,
  ): Promise<string> {
    const slug = this.slugify(value);

    if (!slug) {
      throw new BadRequestException('product slug source is invalid');
    }

    const existing = await this.prisma.product.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      select: { id: true },
    });

    if (existing) {
      throw new ConflictException('product slug already exists');
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

  private toNumber(
    value: number | string | { toNumber?: () => number },
  ): number {
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      return Number(value);
    }
    if (value && typeof value.toNumber === 'function') {
      return value.toNumber();
    }
    return Number(value);
  }

  private mapPersistenceError(error: unknown): never {
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof NotFoundException
    ) {
      throw error;
    }

    const code =
      error && typeof error === 'object' && 'code' in error
        ? String((error as { code?: string }).code)
        : undefined;

    if (code === 'P2025') {
      throw new NotFoundException('products not found');
    }

    if (code === 'P2002') {
      throw new ConflictException('product slug already exists');
    }

    throw new InternalServerErrorException('internal server error');
  }
}


