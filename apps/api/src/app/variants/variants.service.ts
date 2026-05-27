import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { AttributeSummaryDto } from '@org/contracts';
import { CreateVariantDto } from '@org/contracts';
import type { VariantAttributeValueInputDto } from '@org/contracts';
import {
  ListVariantsByProductQueryDto,
  ListVariantsQueryDto,
} from '@org/contracts';
import { ToggleVariantStatusDto } from '@org/contracts';
import { UpdateVariantDto } from '@org/contracts';
import {
  ListVariantsByProductResultDto,
  ListVariantsResultDto,
} from '@org/contracts';
import { VariantDto } from '@org/contracts';
import { VariantDimensionsDto } from '@org/contracts';
import { isUuid } from '@org/validations';
import { PaginationService } from '../common/pagination/pagination.service';

import { PrismaService } from '../prisma/prisma.service';
import {
  VariantRow,
  toVariantDimensionsDto,
  toVariantDto,
} from './mappers/variants.mapper';
import { parseVariantDimensions } from './validations/variants.validation';

const VARIANT_INCLUDE = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
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
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      isRequired: true,
                    },
                  },
                },
              },
            },
          },
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
            select: {
              id: true,
              name: true,
              slug: true,
              isRequired: true,
            },
          },
        },
      },
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
        select: {
          id: true,
          name: true,
          slug: true,
          isRequired: true,
        },
      },
    },
  },
  attributeValues: {
    select: {
      attributeId: true,
      value: true,
      attribute: {
        select: {
          id: true,
          name: true,
          slug: true,
          isRequired: true,
        },
      },
    },
    orderBy: { attributeId: 'asc' },
  },
} as const;

type VariantCursorKeys = { sku: string; id: string };
type VariantAttributeSummary = AttributeSummaryDto & {
  isRequired?: boolean;
};
type VariantProductHierarchy = {
  id: string;
  name: string;
  slug: string;
  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  categories: Array<{
    categoryId: string;
    category: {
      id: string;
      name: string;
      slug: string;
      attributes: Array<{
        attribute: VariantAttributeSummary;
      }>;
    };
  }>;
  attributeLinks: Array<{
    attribute: VariantAttributeSummary;
  }>;
};
type VariantWithRelations = VariantRow & {
  product: VariantProductHierarchy;
  attributeLinks: Array<{
    attribute: VariantAttributeSummary;
  }>;
  attributeValues: Array<{
    attributeId: string;
    value: string;
    attribute: VariantAttributeSummary;
  }>;
};
type VariantDecimalLike = Prisma.Decimal | string | { toString: () => string };

@Injectable()
export class VariantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationService,

  ) {}

  async createVariant(
    input: CreateVariantDto,
  ): Promise<{ variant: VariantDto }> {
    const payload = this.normalizeCreateInput(input);
    this.validateVariantPayload(payload);

    const product = await this.getExistingProductHierarchy(payload.productId);
    await this.ensureVariantDirectAttributesAreValid(
      product,
      payload.attributeIds,
    );
    await this.ensureActiveAttributesExist(payload.attributeIds);
    await this.ensureAttributeValuesAreValid(
      product,
      payload.attributeIds,
      payload.attributeValues,
    );
    await this.ensureSkuAvailable(payload.sku);
    await this.ensureUniqueAttributeCombination(
      payload.productId,
      payload.attributeValues,
    );

    try {
      const row = (await this.prisma.variant.create({
        data: {
          productId: payload.productId,
          sku: payload.sku,
          price: payload.price,
          minimumStock: payload.minimumStock,
          barcodeGtin: payload.barcodeGtin,
          descriptionHtml: payload.descriptionHtml,
          isActive: payload.isActive,
          imageUrls: payload.imageUrls,
          ...(payload.attributeIds.length > 0
            ? {
                attributeLinks: {
                  createMany: {
                    data: payload.attributeIds.map((attributeId) => ({
                      attributeId,
                    })),
                  },
                },
              }
            : {}),
          ...(payload.attributeValues.length > 0
            ? {
                attributeValues: {
                  createMany: {
                    data: payload.attributeValues.map((item) => ({
                      attributeId: item.attributeId,
                      value: item.value,
                    })),
                  },
                },
              }
            : {}),
        },
        include: VARIANT_INCLUDE,
      })) as unknown as VariantWithRelations;

      return { variant: await this.mapVariant(row) };
    } catch (error) {
      throw this.mapPersistenceError(error);
    }
  }

  async getVariant(id: string): Promise<{ variant: VariantDto }> {
    const row = await this.getExistingVariant(id);
    return { variant: await this.mapVariant(row) };
  }

  async getVariantBySku(sku: string): Promise<{ variant: VariantDto }> {
    try {
      const row = (await this.prisma.variant.findFirst({
        where: { sku, deletedAt: null },
        include: VARIANT_INCLUDE,
      })) as VariantWithRelations | null;

      if (!row) {
        throw new NotFoundException('variant not found');
      }

      return { variant: await this.mapVariant(row) };
    } catch (error) {
      throw this.mapPersistenceError(error);
    }
  }

  async listVariantsByProduct(
    productId: string,
    input: ListVariantsByProductQueryDto,
  ): Promise<ListVariantsByProductResultDto> {
    if (!isUuid(productId)) {
      throw new NotFoundException('variant not found');
    }

    return this.listVariants({
      ...input,
      productId,
    });
  }

  async listVariants(
    input: ListVariantsQueryDto,
  ): Promise<ListVariantsResultDto> {
    if (input.paginationType === 'cursor') {
      return this.listVariantsWithCursor(input);
    }

    const pageSize = input.pageSize as number;
    const window = this.pagination.offsetWindow(input.page, pageSize);
    const where = this.listWhere(input.productId, input.isActive);

    try {
      const [rows, totalCount] = await Promise.all([
        this.prisma.variant.findMany({
          where,
          include: VARIANT_INCLUDE,
          orderBy: [{ sku: 'asc' }, { id: 'asc' }],
          take: window.pageSize,
          skip: window.offset,
        }),
        this.prisma.variant.count({ where }),
      ]);

      const metadata = this.pagination.offsetMetadata(
        totalCount,
        window.pageSize,
      );

      return {
        variants: await this.mapVariants(rows as unknown as VariantWithRelations[]),
        pagination: {
          offset: {
            currentPage: input.page as number,
            totalPages: metadata.totalPages,
            totalCount: metadata.totalCount,
          },
        },
      };
    } catch (error) {
      throw this.mapPersistenceError(error);
    }
  }

  async updateVariant(
    id: string,
    input: UpdateVariantDto,
  ): Promise<{ variant: VariantDto }> {
    const current = await this.getExistingVariant(id);
    const merged = this.mergeVariant(current, input);
    this.validateVariantPayload(merged);

    const product = await this.getExistingProductHierarchy(merged.productId);
    await this.ensureVariantDirectAttributesAreValid(
      product,
      merged.attributeIds,
    );
    await this.ensureActiveAttributesExist(merged.attributeIds);
    await this.ensureAttributeValuesAreValid(
      product,
      merged.attributeIds,
      merged.attributeValues,
    );

    if (current.sku !== merged.sku) {
      await this.ensureSkuAvailable(merged.sku, id);
    }

    await this.ensureUniqueAttributeCombination(
      merged.productId,
      merged.attributeValues,
      id,
    );

    try {
      const row = (await this.prisma.$transaction(async (tx: any) => {
        await tx.variant.update({
          where: { id },
          data: {
            sku: merged.sku,
            price: merged.price,
            minimumStock: merged.minimumStock,
            barcodeGtin: merged.barcodeGtin,
            descriptionHtml: merged.descriptionHtml,
            isActive: merged.isActive,
            imageUrls: merged.imageUrls,
          },
        });

        if (input.replaceAttributeIds) {
          await tx.variantAttribute.deleteMany({
            where: { variantId: id },
          });

          if (merged.attributeIds.length > 0) {
            await tx.variantAttribute.createMany({
              data: merged.attributeIds.map((attributeId) => ({
                variantId: id,
                attributeId,
              })),
              skipDuplicates: true,
            });
          }
        } else if (input.attributeIds !== undefined) {
          const providedIds = this.normalizeAttributeIds(input.attributeIds);
          const inheritedIds = this.loadEffectiveProductAttributesSync(
            product,
          ).map((attribute) => attribute.id);
          await tx.variantAttribute.deleteMany({
            where: {
              variantId: id,
              attributeId: {
                in: providedIds.filter((id) => !inheritedIds.includes(id)),
              },
            },
          });

          if (providedIds.length > 0) {
            await tx.variantAttribute.createMany({
              data: providedIds.map((attributeId) => ({
                variantId: id,
                attributeId,
              })),
              skipDuplicates: true,
            });
          }
        }

        if (input.replaceAttributeValues) {
          await tx.variantAttributeValue.deleteMany({
            where: { variantId: id },
          });

          if (merged.attributeValues.length > 0) {
            await tx.variantAttributeValue.createMany({
              data: merged.attributeValues.map((item) => ({
                variantId: id,
                attributeId: item.attributeId,
                value: item.value,
              })),
              skipDuplicates: true,
            });
          }
        } else if (input.attributeValues !== undefined) {
          const providedValues = this.normalizeAttributeValues(
            input.attributeValues,
          );
          const attributeIds = providedValues.map((item) => item.attributeId);
          await tx.variantAttributeValue.deleteMany({
            where: {
              variantId: id,
              attributeId: { in: attributeIds },
            },
          });

          if (providedValues.length > 0) {
            await tx.variantAttributeValue.createMany({
              data: providedValues.map((item) => ({
                variantId: id,
                attributeId: item.attributeId,
                value: item.value,
              })),
              skipDuplicates: true,
            });
          }
        }

        return tx.variant.findFirst({
          where: { id, deletedAt: null },
          include: VARIANT_INCLUDE,
        });
      })) as VariantWithRelations | null;

      if (!row) {
        throw new NotFoundException('variant not found');
      }

      return { variant: await this.mapVariant(row) };
    } catch (error) {
      throw this.mapPersistenceError(error);
    }
  }

  async toggleStatus(
    input: ToggleVariantStatusDto,
  ): Promise<{ success: true }> {
    const current = await this.getExistingVariant(input.id);

    if (current.isActive === input.isActive) {
      return { success: true };
    }

    try {
      await this.prisma.variant.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      });

      return { success: true };
    } catch (error) {
      throw this.mapPersistenceError(error);
    }
  }

  async deleteVariant(id: string): Promise<{ variant: VariantDto }> {
    const current = await this.getExistingVariant(id);

    try {

      await this.prisma.variant.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          isActive: false,
        },
      });

      return {
        variant: await this.toVariantResponse(
          {
            ...current,
            isActive: false,
            attributeLinks: current.attributeLinks,
            attributeValues: [],
          },
          await this.loadGlobalAttributes(),
          0,
        ),
      };
    } catch (error) {
      throw this.mapPersistenceError(error);
    }
  }

  private async listVariantsWithCursor(
    input: ListVariantsQueryDto,
  ): Promise<ListVariantsResultDto> {
    const filterHash = this.pagination.fingerprint({
      scope: 'variants',
      productId: input.productId ?? null,
      isActive: input.isActive ?? null,
    });
    const cursor = this.pagination.cursorPosition<VariantCursorKeys>({
      after: input.after,
      before: input.before,
      filterHash,
    });
    const rows = (await this.prisma.variant.findMany({
      where: this.applyCursor(
        this.listWhere(input.productId, input.isActive),
        cursor?.keys,
        cursor?.isBackward ?? false,
      ),
      include: VARIANT_INCLUDE,
      orderBy:
        cursor?.isBackward === true
          ? [{ sku: 'desc' }, { id: 'desc' }]
          : [{ sku: 'asc' }, { id: 'asc' }],
      take: (input.pageSize as number) + 1,
    })) as unknown as VariantWithRelations[];
    const window = this.pagination.cursorWindow<VariantWithRelations>(
      rows,
      input.pageSize as number,
      cursor?.isBackward ?? false,
    );

    return {
      variants: await this.mapVariants(window.rows),
      pagination: {
        cursor: this.pagination.cursorMetadataFromRows(window.rows, {
          isBackward: cursor?.isBackward ?? false,
          hasAnchor: Boolean(cursor),
          hasMore: window.hasMore,
          filterHash,
          getKeys: (row) => ({ sku: row.sku, id: row.id }),
        }),
      },
    };
  }

  private async getExistingVariant(id: string): Promise<VariantWithRelations> {
    if (!isUuid(id)) {
      throw new NotFoundException('variant not found');
    }

    try {
      const row = (await this.prisma.variant.findFirst({
        where: { id, deletedAt: null },
        include: VARIANT_INCLUDE,
      })) as VariantWithRelations | null;

      if (!row) {
        throw new NotFoundException('variant not found');
      }

      return row;
    } catch (error) {
      throw this.mapPersistenceError(error);
    }
  }

  private async getExistingProductHierarchy(
    productId: string,
  ): Promise<VariantProductHierarchy> {
    if (!isUuid(productId)) {
      throw new BadRequestException(
        'validation error: product_id must be a valid UUID',
      );
    }

    const row = await this.prisma.product.findFirst({
      where: {
        id: productId,
        deletedAt: null,
      },
      select: VARIANT_INCLUDE.product.select,
    });

    if (!row) {
      throw new NotFoundException('product not found');
    }

    return row as VariantProductHierarchy;
  }

  private async mapVariants(
    rows: VariantWithRelations[],
  ): Promise<VariantDto[]> {
    const globalAttributes = await this.loadGlobalAttributes();

    return rows.map((row) =>
      this.toVariantResponse(row, globalAttributes, 0),
    );
  }

  private async mapVariant(row: VariantWithRelations): Promise<VariantDto> {
    const globalAttributes = await this.loadGlobalAttributes();

    return this.toVariantResponse(
      row,
      globalAttributes,
      0,
    );
  }

  private toVariantResponse(
    row: VariantWithRelations,
    globalAttributes: VariantAttributeSummary[],
    stockQuantity: number,
  ): VariantDto {
    const inheritedAttributes = this.uniqueAttributes(
      globalAttributes,
      row.product.categories.flatMap((category) =>
        (category.category.attributes ?? []).map((link) => link.attribute),
      ),
      row.product.attributeLinks.map((link) => link.attribute),
    );
    const directAttributes = this.uniqueAttributes(
      row.attributeLinks.map((link) => link.attribute),
    );
    const attributes = this.uniqueAttributes(
      inheritedAttributes,
      directAttributes,
    );

    return toVariantDto(row, {
      directAttributes,
      attributes,
      stockQuantity,
    });
  }

  private normalizeCreateInput(input: CreateVariantDto) {
    return {
      productId: input.productId,
      sku: input.sku,
      price: this.parseDecimalField('price', input.price),
      minimumStock: input.minimumStock ?? 0,
      barcodeGtin: input.barcodeGtin ?? null,
      descriptionHtml: input.descriptionHtml ?? null,
      dimensions: this.normalizeVariantDimensions(input.dimensions),
      isActive: input.isActive ?? false,
      imageUrls: input.imageUrls ?? [],
      attributeIds: this.normalizeAttributeIds(input.attributeIds),
      attributeValues: this.normalizeAttributeValues(input.attributeValues),
    };
  }

  private mergeVariant(current: VariantWithRelations, input: UpdateVariantDto) {
    const nextBarcode = input.clearBarcodeGtin
      ? null
      : input.barcodeGtin !== undefined
        ? input.barcodeGtin
        : current.barcodeGtin;
    const nextDescription = input.clearDescriptionHtml
      ? null
      : input.descriptionHtml !== undefined
        ? input.descriptionHtml
        : current.descriptionHtml;
    const nextOfferPrice = input.clearOfferPrice
      ? null
      : input.offerPrice !== undefined
        ? this.parseDecimalField('offer_price', input.offerPrice)
        : current.offerPrice;
    const nextOfferStart = input.clearOfferStart
      ? null
      : input.offerStart !== undefined
        ? this.parseTimestamp(input.offerStart)
        : current.offerStart;
    const nextOfferEnd = input.clearOfferEnd
      ? null
      : input.offerEnd !== undefined
        ? this.parseTimestamp(input.offerEnd)
        : current.offerEnd;
    const nextDimensions = input.clearDimensions
      ? null
      : input.dimensions !== undefined
        ? this.normalizeVariantDimensions(input.dimensions)
        : toVariantDimensionsDto(current.dimensions);
    const nextImageUrls = input.replaceImageUrls
      ? (input.imageUrls ?? [])
      : (current.imageUrls ?? []);
    const currentAttributeIds = current.attributeLinks.map(
      (item) => item.attribute.id,
    );
    const nextAttributeIds = this.mergeAttributeIds(
      currentAttributeIds,
      input.attributeIds,
      input.replaceAttributeIds === true,
    );
    const currentAttributeValues = current.attributeValues.map((item) => ({
      attributeId: item.attributeId,
      value: item.value,
    }));
    const nextAttributeValues = this.mergeAttributeValues(
      currentAttributeValues,
      input.attributeValues,
      input.replaceAttributeValues === true,
    );

    return {
      id: current.id,
      productId: current.product.id,
      sku: input.sku ?? current.sku,
      price:
        input.price !== undefined
          ? this.parseDecimalField('price', input.price)
          : current.price,
      minimumStock: input.minimumStock ?? current.minimumStock,
      barcodeGtin: nextBarcode,
      descriptionHtml: nextDescription,
      offerPrice: nextOfferPrice,
      offerStart: nextOfferStart,
      offerEnd: nextOfferEnd,
      dimensions: nextDimensions,
      isActive: input.isActive ?? current.isActive,
      imageUrls: nextImageUrls,
      attributeIds: nextAttributeIds,
      attributeValues: nextAttributeValues,
    };
  }

  private validateVariantPayload(input: {
    productId: string;
    sku: string;
    price: VariantDecimalLike | null;
    minimumStock: number;
    barcodeGtin: string | null;
    descriptionHtml: string | null;
    dimensions: unknown;
    isActive: boolean;
    imageUrls: string[];
    attributeIds: string[];
    attributeValues: Array<{ attributeId: string; value: string }>;
  }) {
    if (input.productId.trim() === '') {
      throw new BadRequestException('validation error: product_id is required');
    }

    const sku = input.sku.trim();
    if (!/^[A-Za-z0-9-]{5,32}$/.test(sku)) {
      throw new BadRequestException(
        'validation error: sku must be 5 to 32 chars and contain only letters, numbers, and hyphens',
      );
    }

    if (input.minimumStock < 0) {
      throw new BadRequestException(
        'validation error: minimum_stock cannot be negative',
      );
    }

    if (
      input.price &&
      new Prisma.Decimal(this.decimalLikeToString(input.price)).lessThan(0)
    ) {
      throw new BadRequestException(
        'validation error: price cannot be negative',
      );
    }

    if (input.barcodeGtin !== null) {
      this.validateGtin(input.barcodeGtin);
    }
  }

  private normalizeVariantDimensions(
    value?: VariantDimensionsDto,
  ): VariantDimensionsDto | null {
    if (value === undefined) {
      return null;
    }

    const issues: string[] = [];
    const dimensions = parseVariantDimensions(value, issues);

    if (issues.length > 0) {
      throw new BadRequestException(`validation error: ${issues.join('; ')}`);
    }

    return dimensions ?? {};
  }

  private validateGtin(value: string) {
    if (value === '') {
      return;
    }

    if (!/^\d+$/.test(value)) {
      throw new BadRequestException(
        'validation error: barcode_gtin must contain only digits',
      );
    }

    if (![8, 12, 13, 14].includes(value.length)) {
      throw new BadRequestException(
        'validation error: barcode_gtin length must be 8, 12, 13, or 14 digits',
      );
    }

    let sum = 0;
    let weight = 3;
    for (let index = value.length - 2; index >= 0; index -= 1) {
      sum += Number(value[index]) * weight;
      weight = weight === 3 ? 1 : 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;

    if (checkDigit !== Number(value[value.length - 1])) {
      throw new BadRequestException('gtin check digit validation failed');
    }
  }

  private parseDecimalField(
    field: 'price' | 'offer_price',
    value: string | undefined,
  ): Prisma.Decimal | null {
    if (value === undefined || value === '') {
      return null;
    }

    try {
      return new Prisma.Decimal(value);
    } catch (error) {
      throw new BadRequestException(
        `invalid ${field}: ${(error as Error).message}`,
      );
    }
  }

  private parseTimestamp(value: string | undefined): Date | null {
    if (value === undefined) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      throw new BadRequestException('invalid timestamp');
    }
    return parsed;
  }

  private decimalLikeToString(value: VariantDecimalLike): string {
    return typeof value === 'string' ? value : value.toString();
  }

  private async ensureSkuAvailable(sku: string, excludedId?: string) {
    const row = await this.prisma.variant.findFirst({
      where: {
        sku,
        deletedAt: null,
        ...(excludedId ? { id: { not: excludedId } } : {}),
      },
      select: { id: true },
    });

    if (row) {
      throw new ConflictException('variant sku already exists');
    }
  }

  private async ensureAttributeValuesAreValid(
    product: VariantProductHierarchy,
    directAttributeIds: string[],
    attributeValues: Array<{ attributeId: string; value: string }>,
  ) {
    const effectiveProductAttributes =
      await this.loadEffectiveProductAttributes(product, directAttributeIds);
    const effectiveIds = new Set(
      effectiveProductAttributes.map((attribute) => attribute.id),
    );
    const providedIds = new Set(
      attributeValues.map((item) => item.attributeId),
    );

    const missingEffectiveId = [...effectiveIds].find(
      (attributeId) => !providedIds.has(attributeId),
    );

    if (missingEffectiveId) {
      throw new BadRequestException(
        'validation error: variants must provide string values for all effective variant attributes',
      );
    }

    const unexpectedAttributeId = [...providedIds].find(
      (attributeId) => !effectiveIds.has(attributeId),
    );

    if (unexpectedAttributeId) {
      throw new BadRequestException(
        'validation error: attribute_values may only contain inherited or variant-owned attributes',
      );
    }

    const providedAttributes = await this.loadAttributesByIds([...providedIds]);
    if (providedAttributes.length !== providedIds.size) {
      throw new BadRequestException(
        'validation error: attribute_values must contain active attribute UUIDs',
      );
    }
  }

  private async loadEffectiveProductAttributes(
    product: VariantProductHierarchy,
    directAttributeIds: string[] = [],
  ): Promise<VariantAttributeSummary[]> {
    const globalAttributes = await this.loadGlobalAttributes();
    const variantDirectAttributes =
      await this.loadAttributesByIds(directAttributeIds);

    const categoryAttributes = product.categories.flatMap((category) =>
      (category.category.attributes ?? []).map((link) => link.attribute),
    );
    const directAttributes = product.attributeLinks.map(
      (link) => link.attribute,
    );

    return this.uniqueAttributes(
      globalAttributes,
      categoryAttributes,
      directAttributes,
      variantDirectAttributes,
    );
  }

  private async ensureVariantDirectAttributesAreValid(
    product: VariantProductHierarchy,
    directAttributeIds: string[],
  ) {
    if (directAttributeIds.length === 0) {
      return;
    }

    const inheritedAttributes =
      await this.loadEffectiveProductAttributes(product);
    const inheritedIds = new Set(
      inheritedAttributes.map((attribute) => attribute.id),
    );
    const overlappingId = directAttributeIds.find((id) => inheritedIds.has(id));

    if (overlappingId) {
      throw new BadRequestException(
        'validation error: attribute_ids may only contain variant-owned attributes',
      );
    }
  }

  private loadEffectiveProductAttributesSync(
    product: VariantProductHierarchy,
  ): VariantAttributeSummary[] {
    return this.uniqueAttributes(
      product.categories.flatMap((category) =>
        (category.category.attributes ?? []).map((link) => link.attribute),
      ),
      product.attributeLinks.map((link) => link.attribute),
    );
  }

  private async loadGlobalAttributes(): Promise<VariantAttributeSummary[]> {
    const rows = await this.prisma.attribute.findMany({
      where: {
        deletedAt: null,
        isActive: true,
        appliesToAll: true,
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        isRequired: true,
      },
    });

    return rows;
  }

  private async loadAttributesByIds(
    attributeIds: string[],
  ): Promise<VariantAttributeSummary[]> {
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
      select: {
        id: true,
        name: true,
        slug: true,
        isRequired: true,
      },
    });

    return rows;
  }

  private uniqueAttributes(
    ...groups: Array<VariantAttributeSummary[] | undefined>
  ): VariantAttributeSummary[] {
    const seen = new Map<string, VariantAttributeSummary>();

    for (const group of groups) {
      if (!group) {
        continue;
      }

      for (const attribute of group) {
        if (!seen.has(attribute.id)) {
          seen.set(attribute.id, attribute);
        }
      }
    }

    return [...seen.values()];
  }

  private normalizeAttributeValues(
    values?: VariantAttributeValueInputDto[],
  ): Array<{ attributeId: string; value: string }> {
    const seen = new Set<string>();
    const normalized: Array<{ attributeId: string; value: string }> = [];

    for (const item of values ?? []) {
      const attributeId = item.attributeId.trim();
      const value = item.value.trim();

      if (attributeId === '') {
        throw new BadRequestException(
          'validation error: attribute_id is required',
        );
      }

      if (!isUuid(attributeId)) {
        throw new BadRequestException(
          'validation error: attribute_id must be a valid UUID',
        );
      }

      if (value === '') {
        throw new BadRequestException(
          'validation error: attribute value is required',
        );
      }

      if (seen.has(attributeId)) {
        throw new BadRequestException(
          `validation error: duplicate attribute_id ${attributeId}`,
        );
      }

      seen.add(attributeId);
      normalized.push({ attributeId, value });
    }

    return normalized;
  }

  private normalizeAttributeIds(attributeIds?: string[]): string[] {
    const seen = new Set<string>();
    const normalized: string[] = [];

    for (const attributeId of attributeIds ?? []) {
      const trimmed = attributeId.trim();

      if (trimmed === '') {
        throw new BadRequestException(
          'validation error: attribute_id is required',
        );
      }

      if (!isUuid(trimmed)) {
        throw new BadRequestException(
          'validation error: attribute_id must be a valid UUID',
        );
      }

      if (seen.has(trimmed)) {
        throw new BadRequestException(
          `validation error: duplicate attribute_id ${trimmed}`,
        );
      }

      seen.add(trimmed);
      normalized.push(trimmed);
    }

    return normalized;
  }

  private mergeAttributeIds(
    current: string[],
    nextInput: string[] | undefined,
    replace: boolean,
  ): string[] {
    if (nextInput === undefined) {
      return current;
    }

    const next = this.normalizeAttributeIds(nextInput);
    if (replace) {
      return next;
    }

    return [...new Set([...current, ...next])];
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

  private mergeAttributeValues(
    current: Array<{ attributeId: string; value: string }>,
    nextInput: VariantAttributeValueInputDto[] | undefined,
    replace: boolean,
  ) {
    if (nextInput === undefined) {
      return current;
    }

    const next = this.normalizeAttributeValues(nextInput);
    if (replace) {
      return next;
    }

    const merged = new Map(current.map((item) => [item.attributeId, item]));
    for (const item of next) {
      merged.set(item.attributeId, item);
    }

    return [...merged.values()];
  }

  private async ensureUniqueAttributeCombination(
    productId: string,
    attributeValues: Array<{ attributeId: string; value: string }>,
    excludedId?: string,
  ) {
    const normalized = attributeValues
      .map((item) => `${item.attributeId}:${item.value}`)
      .sort();
    const rows = await this.prisma.variant.findMany({
      where: {
        productId,
        deletedAt: null,
        ...(excludedId ? { id: { not: excludedId } } : {}),
      },
      select: {
        id: true,
        attributeValues: {
          select: { attributeId: true, value: true },
          orderBy: { attributeId: 'asc' },
        },
      },
    });

    const duplicate = rows.some((row) => {
      const current = row.attributeValues
        .map((item) => `${item.attributeId}:${item.value}`)
        .sort();
      if (current.length !== normalized.length) {
        return false;
      }

      return current.every((value, index) => value === normalized[index]);
    });

    if (duplicate) {
      throw new ConflictException('duplicate variant attribute combination');
    }
  }

  private applyCursor(
    baseWhere: { deletedAt: null; productId?: string; isActive?: boolean },
    keys?: VariantCursorKeys,
    isBackward?: boolean,
  ) {
    if (!keys) {
      return baseWhere;
    }

    return {
      ...baseWhere,
      OR: isBackward
        ? [{ sku: { lt: keys.sku } }, { sku: keys.sku, id: { lt: keys.id } }]
        : [{ sku: { gt: keys.sku } }, { sku: keys.sku, id: { gt: keys.id } }],
    };
  }

  private listWhere(
    productId?: string,
    isActive?: boolean,
  ): {
    deletedAt: null;
    productId?: string;
    isActive?: boolean;
  } {
    return {
      deletedAt: null,
      ...(productId ? { productId } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    };
  }

  private mapPersistenceError(error: unknown): never {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException ||
      error instanceof ConflictException ||
      error instanceof InternalServerErrorException
    ) {
      throw error;
    }

    if (error instanceof Error) {
      throw new InternalServerErrorException(error.message);
    }

    throw new InternalServerErrorException('internal server error');
  }
}


