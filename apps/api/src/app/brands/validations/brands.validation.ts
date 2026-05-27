import { LegacyHttpException } from '../../common/http/legacy-http-exception.filter';
import {
  CreateBatchBrandDto,
  CreateBrandDto,
} from '@org/contracts';
import { ListBrandsQueryDto } from '@org/contracts';
import {
  ToggleBrandActiveDto,
  ToggleBrandVisibleInMenuDto,
} from '@org/contracts';
import { UpdateBrandDto } from '@org/contracts';
import {
  legacyCoerceBoolean,
  objectValue,
  optionalNullableBoolean,
  optionalNullableString,
  optionalPositiveInt,
  optionalString,
  optionalStringValue,
  optionalTrimmedStringValue,
  optionalUrlOrEmpty,
  requireBoolean,
  requireString,
  requireUuid,
  throwIfInvalid,
} from '@org/validations';

export function validateCreateBrandBody(value: unknown): CreateBrandDto {
  const body = objectValue(value);
  const issues: string[] = [];

  requireString(body.name, 'name', issues, { min: 1, max: 100 });
  optionalString(body.description, 'description', issues, { max: 500 });
  requireBoolean(body.isActive, 'isActive', issues);
  requireBoolean(body.visibleInMenu, 'visibleInMenu', issues);
  requireString(body.logoUrl, 'logoUrl', issues, { min: 1 });
  optionalUrlOrEmpty(body.website, 'website', issues);
  optionalString(body.metaTitle, 'metaTitle', issues, { max: 100 });
  requireString(body.metaDescription, 'metaDescription', issues, { max: 160 });

  throwIfInvalid(issues, throwInvalid);
  return body as unknown as CreateBrandDto;
}

export function validateUpdateBrandBody(value: unknown): UpdateBrandDto {
  const body = objectValue(value);
  const issues: string[] = [];

  optionalNullableString(body.name, 'name', issues, { min: 1, max: 100 });
  optionalNullableString(body.description, 'description', issues);
  optionalNullableBoolean(body.isActive, 'isActive', issues);
  optionalNullableString(body.logoUrl, 'logoUrl', issues);
  optionalNullableString(body.website, 'website', issues);
  optionalNullableString(body.metaTitle, 'metaTitle', issues);
  optionalNullableString(body.metaDescription, 'metaDescription', issues);
  optionalNullableString(body.slug, 'slug', issues);
  optionalNullableBoolean(body.visibleInMenu, 'visibleInMenu', issues);

  throwIfInvalid(issues, throwInvalid);
  return body as unknown as UpdateBrandDto;
}

export function validateCreateBatchBody(value: unknown): {
  brands: CreateBatchBrandDto[];
} {
  const body = objectValue(value);
  const issues: string[] = [];

  if (!Array.isArray(body.brands)) {
    issues.push('brands must be an array');
  } else {
    const seen = new Map<string, string>();
    for (const item of body.brands) {
      const brand = objectValue(item);
      if (typeof brand.key !== 'string' || brand.key.length < 1) {
        issues.push('key is required');
      }
      try {
        validateCreateBrandBody(brand);
      } catch (error) {
        if (error instanceof LegacyHttpException) {
          issues.push(error.message);
        }
      }
      if (typeof brand.name === 'string') {
        const previousKey = seen.get(brand.name);
        if (previousKey) {
          issues.push(
            `Duplicate name for keys ${previousKey} and ${brand.key}`,
          );
        }
        seen.set(brand.name, String(brand.key));
      }
    }
  }

  throwIfInvalid(issues, throwInvalid);
  return body as unknown as { brands: CreateBatchBrandDto[] };
}

export function validateListBrandsQuery(value: unknown): ListBrandsQueryDto {
  const query = objectValue(value);
  const issues: string[] = [];
  const pageSize = optionalPositiveInt(query.pageSize, 'pageSize', issues, 50);
  const page = optionalPositiveInt(query.page, 'page', issues);
  const rawPaginationType =
    query.paginationType === undefined || query.paginationType === ''
      ? undefined
      : query.paginationType;
  const paginationType =
    typeof rawPaginationType === 'string'
      ? rawPaginationType.toLowerCase()
      : rawPaginationType;

  if (
    paginationType !== undefined &&
    paginationType !== 'offset' &&
    paginationType !== 'cursor'
  ) {
    issues.push('paginationType must be offset or cursor');
  }

  const after = optionalStringValue(query.after, 'after', issues);
  const before = optionalStringValue(query.before, 'before', issues);
  const searchQuery = optionalTrimmedStringValue(query.query, 'query', issues);

  if (after && before) {
    issues.push('Use only one cursor position at a time');
  }
  const hasCursor = Boolean(after || before);
  if (hasCursor && page !== undefined) {
    issues.push('Offset page cannot be combined with cursor pagination');
  }
  if (hasCursor && paginationType !== 'cursor') {
    issues.push('Cursor tokens require paginationType=cursor');
  }
  if (paginationType === 'cursor' && page !== undefined) {
    issues.push('paginationType=cursor cannot be combined with page');
  }

  throwIfInvalid(issues, throwInvalid);

  return {
    pageSize,
    page,
    paginationType: paginationType as 'offset' | 'cursor' | undefined,
    after,
    before,
    query: searchQuery,
    name: optionalStringValue(query.name, 'name', issues),
    metaTitle: optionalStringValue(query.metaTitle, 'metaTitle', issues),
    isActive: legacyCoerceBoolean(query.isActive),
    website: optionalStringValue(query.website, 'website', issues),
    slug: optionalStringValue(query.slug, 'slug', issues),
  };
}

export function validateToggleActiveBody(value: unknown): ToggleBrandActiveDto {
  const body = objectValue(value);
  const issues: string[] = [];
  requireUuid(body.id, 'id', issues);
  requireBoolean(body.isActive, 'isActive', issues);
  throwIfInvalid(issues, throwInvalid);
  return body as unknown as ToggleBrandActiveDto;
}

export function validateToggleVisibleBody(
  value: unknown,
): ToggleBrandVisibleInMenuDto {
  const body = objectValue(value);
  const issues: string[] = [];
  requireUuid(body.id, 'id', issues);
  requireBoolean(body.visibleInMenu, 'visibleInMenu', issues);
  throwIfInvalid(issues, throwInvalid);
  return body as unknown as ToggleBrandVisibleInMenuDto;
}

export function validateDeleteParams(value: unknown): { id: string } {
  const params = objectValue(value);
  const issues: string[] = [];
  requireUuid(params.id, 'id', issues);
  throwIfInvalid(issues, throwInvalid);
  return params as unknown as { id: string };
}

export function validateGetParams(value: unknown): { id: string } {
  const params = objectValue(value);
  const issues: string[] = [];
  requireUuid(params.id, 'id', issues);
  throwIfInvalid(issues, throwInvalid);
  return params as unknown as { id: string };
}

export function throwInvalid(issues: string[]) {
  throw new LegacyHttpException(400, 'Invalid input', {
    issues,
  });
}


