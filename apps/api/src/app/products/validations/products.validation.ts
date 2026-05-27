import { BadRequestException, NotImplementedException } from '@nestjs/common';
import {
  CreateBatchProductDto,
  CreateProductDto,
} from '@org/contracts';
import { ProductDimensionsDto } from '@org/contracts';
import { ListProductsQueryDto } from '@org/contracts';
import {
  ToggleProductFeaturedDto,
  ToggleProductStatusDto,
} from '@org/contracts';
import { UpdateProductDto } from '@org/contracts';
import {
  isUuid,
  objectValue,
  optionalBoolean,
  optionalNumber,
  optionalPlainObject,
  optionalPositiveInt,
  optionalString,
  optionalStringArray,
  optionalStringValue,
  requireBoolean,
  requireNumber,
  requireString,
  requireStringArray,
  requireUuid,
  throwIfInvalid,
} from '@org/validations';
import { LegacyHttpException } from '../../common/http/legacy-http-exception.filter';

export function validateCreateProductBody(value: unknown): CreateProductDto {
  const body = objectValue(value);
  const issues: string[] = [];

  requireString(body.name, 'name', issues, { min: 1 });
  requireString(body.modelYear, 'modelYear', issues, { min: 1 });
  requireString(body.descriptionHtml, 'descriptionHtml', issues, { min: 1 });
  optionalString(body.descriptionShort, 'descriptionShort', issues);
  optionalString(body.specificationsHtml, 'specificationsHtml', issues);
  requireNumber(body.basePrice, 'basePrice', issues);
  requireBoolean(body.isActive, 'isActive', issues);
  requireBoolean(body.isFeatured, 'isFeatured', issues);
  requireStringArray(body.categoriesId, 'categoriesId', issues);
  optionalStringArray(body.attributeIds, 'attributeIds', issues);
  optionalString(body.brandId, 'brandId', issues, { min: 1 });
  const dimensionsBase = parseProductDimensions(body.dimensionsBase, issues);

  throwIfInvalid(issues, throwInvalid);
  return {
    ...body,
    dimensionsBase,
  } as unknown as CreateProductDto;
}

export function validateCreateBatchProductsBody(value: unknown): {
  products: CreateBatchProductDto[];
} {
  const body = objectValue(value);
  const issues: string[] = [];

  if (!Array.isArray(body.products)) {
    issues.push('products must be an array');
  } else {
    const seen = new Map<string, string>();
    for (const item of body.products) {
      const product = objectValue(item);
      const key = typeof product.key === 'string' ? product.key.trim() : '';

      if (key.length < 1) {
        issues.push('key is required');
      }

      try {
        validateCreateProductBody(product);
      } catch (error) {
        if (error instanceof LegacyHttpException) {
          issues.push(error.message);
        } else if (error instanceof Error) {
          issues.push(error.message);
        }
      }

      if (typeof product.name === 'string') {
        const name = product.name.trim();
        const previousKey = seen.get(name);
        if (previousKey) {
          issues.push(`Duplicate name for keys ${previousKey} and ${key}`);
        }
        seen.set(name, key);
      }
    }
  }

  throwIfInvalid(issues, throwInvalid);
  return body as unknown as { products: CreateBatchProductDto[] };
}

export function validateUpdateProductBody(value: unknown): UpdateProductDto {
  const body = objectValue(value);
  const issues: string[] = [];

  optionalString(body.name, 'name', issues, { min: 1 });
  optionalString(body.modelYear, 'modelYear', issues, { min: 1 });
  optionalString(body.descriptionHtml, 'descriptionHtml', issues, { min: 1 });
  optionalString(body.descriptionShort, 'descriptionShort', issues);
  optionalString(body.specificationsHtml, 'specificationsHtml', issues);
  optionalNumber(body.basePrice, 'basePrice', issues);
  optionalBoolean(body.isActive, 'isActive', issues);
  optionalBoolean(body.isFeatured, 'isFeatured', issues);
  optionalStringArray(body.categoriesId, 'categoriesId', issues);
  optionalStringArray(body.attributeIds, 'attributeIds', issues);
  optionalString(body.brandId, 'brandId', issues, { min: 1 });
  const dimensionsBase = parseProductDimensions(body.dimensionsBase, issues);

  throwIfInvalid(issues, throwInvalid);
  return {
    ...body,
    dimensionsBase,
  } as UpdateProductDto;
}

export function validateListProductsQuery(
  value: unknown,
): ListProductsQueryDto {
  const query = objectValue(value);
  const issues: string[] = [];
  const paginationType =
    typeof query.paginationType === 'string'
      ? query.paginationType.toLowerCase()
      : query.paginationType;

  if (paginationType !== 'offset' && paginationType !== 'cursor') {
    if (paginationType === undefined || paginationType === '') {
      issues.push('paginationType is required');
    } else {
      throw new NotImplementedException('unsupported pagination strategy');
    }
  }

  const pageSize = optionalPositiveInt(query.pageSize, 'pageSize', issues);
  const page = optionalPositiveInt(query.page, 'page', issues);
  const after = optionalStringValue(query.after, 'after', issues);
  const before = optionalStringValue(query.before, 'before', issues);
  const searchQuery = optionalStringValue(query.query, 'query', issues);

  if (pageSize === undefined) {
    issues.push('pageSize must be a positive integer');
  }

  if (after && before) {
    issues.push('Use only one cursor position at a time');
  }

  if (paginationType === 'offset' && (after || before)) {
    issues.push('offset pagination cannot be combined with cursor positions');
  }

  if (paginationType === 'cursor' && page !== undefined) {
    issues.push('cursor pagination cannot be combined with page');
  }

  throwIfInvalid(issues, throwInvalid);

  return {
    paginationType: paginationType as 'offset' | 'cursor',
    query: searchQuery,
    pageSize,
    page,
    after,
    before,
  };
}

export function validateProductParams(value: unknown): { id: string } {
  const params = objectValue(value);
  const issues: string[] = [];

  requireUuid(params.id, 'id', issues);
  throwIfInvalid(issues, throwInvalid);

  return { id: String(params.id) };
}

export function validateProductSlugParams(value: unknown): { slug: string } {
  const params = objectValue(value);
  const issues: string[] = [];

  requireString(params.slug, 'slug', issues, { min: 1 });
  throwIfInvalid(issues, throwInvalid);

  return { slug: String(params.slug) };
}

export function validateProductCategoryParams(value: unknown): {
  categoryId: string;
} {
  const params = objectValue(value);
  const issues: string[] = [];

  requireUuid(params.categoryId, 'categoryId', issues);
  throwIfInvalid(issues, throwInvalid);

  return { categoryId: String(params.categoryId) };
}

export function validateToggleStatusInput(
  paramsValue: unknown,
  bodyValue: unknown,
): ToggleProductStatusDto {
  const params = validateProductParams(paramsValue);
  const body = objectValue(bodyValue);
  const issues: string[] = [];

  requireBoolean(body.isActive, 'isActive', issues);
  throwIfInvalid(issues, throwInvalid);

  return {
    id: params.id,
    isActive: body.isActive as boolean,
  };
}

export function validateToggleFeaturedInput(
  paramsValue: unknown,
  bodyValue: unknown,
): ToggleProductFeaturedDto {
  const params = validateProductParams(paramsValue);
  const body = objectValue(bodyValue);
  const issues: string[] = [];

  requireBoolean(body.isFeatured, 'isFeatured', issues);
  throwIfInvalid(issues, throwInvalid);

  return {
    id: params.id,
    isFeatured: body.isFeatured as boolean,
  };
}

export function assertProductReferenceIds(input: {
  brandId?: string;
  categoriesId?: string[];
  attributeIds?: string[];
}) {
  if (
    input.brandId !== undefined &&
    input.brandId !== '' &&
    !isUuid(input.brandId)
  ) {
    throw new BadRequestException(
      'validation error: brand_id must be a valid UUID',
    );
  }

  for (const categoryId of input.categoriesId ?? []) {
    if (!isUuid(categoryId)) {
      throw new BadRequestException(
        'validation error: categories_id must contain valid UUIDs',
      );
    }
  }

  for (const attributeId of input.attributeIds ?? []) {
    if (!isUuid(attributeId)) {
      throw new BadRequestException(
        'validation error: attribute_ids must contain valid UUIDs',
      );
    }
  }
}

const PRODUCT_DIMENSION_FIELDS = [
  'weight',
  'length',
  'width',
  'height',
] as const;

export function parseProductDimensions(
  value: unknown,
  issues: string[],
): ProductDimensionsDto | undefined {
  if (value === undefined) {
    return undefined;
  }

  const dimensions = optionalPlainObject(value, 'dimensionsBase', issues);
  if (!dimensions) {
    return undefined;
  }

  if ('weightUnit' in dimensions) {
    issues.push(
      'dimensionsBase.weightUnit is not supported; include the unit in dimensionsBase.weight',
    );
  }

  for (const field of PRODUCT_DIMENSION_FIELDS) {
    const fieldValue = dimensions[field];
    if (fieldValue !== undefined && typeof fieldValue !== 'string') {
      issues.push(`dimensionsBase.${field} must be a string`);
    }
  }

  return productDimensionsFromRecord(dimensions);
}

export function productDimensionsFromRecord(
  dimensions: Record<string, unknown>,
): ProductDimensionsDto {
  return PRODUCT_DIMENSION_FIELDS.reduce<ProductDimensionsDto>((acc, field) => {
    const value = dimensions[field];
    if (typeof value === 'string') {
      acc[field] = value;
    }
    return acc;
  }, {});
}

export function throwInvalid(issues: string[]) {
  throw new LegacyHttpException(400, 'Invalid input', {
    issues,
  });
}


