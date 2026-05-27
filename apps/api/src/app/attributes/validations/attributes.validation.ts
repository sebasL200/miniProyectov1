import { LegacyHttpException } from '../../common/http/legacy-http-exception.filter';
import {
  CreateAttributeDto,
  CreateBatchAttributeDto,
} from '@org/contracts';
import { ListAttributesQueryDto } from '@org/contracts';
import { UpdateAttributeDto } from '@org/contracts';
import {
  legacyCoerceBoolean,
  objectValue,
  optionalBoolean,
  optionalPositiveInt,
  optionalString,
  optionalStringValue,
  requireString,
  requireUuid,
  throwIfInvalid,
} from '@org/validations';

export type ParsedIfMatch = { expectedVersion: number };

export function validateCreateAttributeBody(
  value: unknown,
): CreateAttributeDto {
  const body = objectValue(value);
  const issues: string[] = [];

  requireString(body.name, 'name', issues, { min: 2, max: 100 });
  optionalString(body.description, 'description', issues, { max: 255 });
  optionalBoolean(body.isActive, 'isActive', issues);
  optionalBoolean(body.isFilterable, 'isFilterable', issues);
  optionalBoolean(body.appliesToAll, 'appliesToAll', issues);
  optionalBoolean(body.isRequired, 'isRequired', issues);
  validateCategoryIds(body.categoryIds, issues);

  const appliesToAll = body.appliesToAll === true;
  const categoryIds = Array.isArray(body.categoryIds) ? body.categoryIds : [];
  if (!appliesToAll && categoryIds.length === 0) {
    issues.push(
      'At least one category must be selected when appliesToAll is false',
    );
  }

  throwIfInvalid(issues, throwInvalidInput);
  return {
    ...body,
    isActive: body.isActive ?? true,
    isFilterable: body.isFilterable ?? false,
    appliesToAll: body.appliesToAll ?? false,
    isRequired: body.isRequired ?? false,
  } as unknown as CreateAttributeDto;
}

export function validateCreateBatchBody(value: unknown): {
  attributes: CreateBatchAttributeDto[];
} {
  const body = objectValue(value);
  const issues: string[] = [];

  if (!Array.isArray(body.attributes)) {
    issues.push('attributes must be an array');
  } else {
    const seen = new Map<string, string>();
    for (const item of body.attributes) {
      const attribute = objectValue(item);
      if (typeof attribute.key !== 'string' || attribute.key.length < 1) {
        issues.push('key is required');
      }
      try {
        validateCreateAttributeBody(attribute);
      } catch (error) {
        if (error instanceof LegacyHttpException) {
          issues.push(error.message);
        }
      }
      if (typeof attribute.name === 'string') {
        const previousKey = seen.get(attribute.name);
        if (previousKey) {
          issues.push(
            `Duplicate name for keys ${previousKey} and ${attribute.key}`,
          );
        }
        seen.set(attribute.name, String(attribute.key));
      }
    }
  }

  throwIfInvalid(issues, throwInvalidInput);
  return body as unknown as { attributes: CreateBatchAttributeDto[] };
}

export function validateListAttributesQuery(
  value: unknown,
): ListAttributesQueryDto {
  const query = objectValue(value);
  const issues: string[] = [];
  const pageSize = optionalPositiveInt(query.pageSize, 'pageSize', issues, 50);
  const page = optionalPositiveInt(query.page, 'page', issues);
  const categoryIds = optionalUuidList(
    query.categoryIds ?? query.categoryId,
    'categoryIds',
    issues,
  );
  const exclude = optionalExcludeList(query.exclude, issues);
  const or = optionalOrList(query.or, issues);
  const appliesToAll = optionalQueryBoolean(
    query.appliesToAll,
    'appliesToAll',
    issues,
  );
  const rawPaginationType =
    query.paginationType === undefined || query.paginationType === ''
      ? undefined
      : query.paginationType;
  const paginationType =
    typeof rawPaginationType === 'string'
      ? rawPaginationType.toLowerCase()
      : rawPaginationType;
  const after = optionalStringValue(query.after, 'after', issues);
  const before = optionalStringValue(query.before, 'before', issues);

  if (
    paginationType !== undefined &&
    paginationType !== 'offset' &&
    paginationType !== 'cursor' &&
    paginationType !== 'none'
  ) {
    issues.push('paginationType must be offset, cursor, or none');
  }

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
  if (paginationType === 'none' && page !== undefined) {
    issues.push('paginationType=none cannot be combined with page');
  }
  if (paginationType === 'none' && pageSize !== undefined) {
    issues.push('paginationType=none cannot be combined with pageSize');
  }
  if (paginationType === 'none' && hasCursor) {
    issues.push('paginationType=none cannot be combined with cursor positions');
  }

  throwIfInvalid(issues, throwInvalidInput);

  return {
    showDeleted: legacyCoerceBoolean(query.showDeleted) ?? false,
    pageSize,
    page:
      paginationType === 'cursor' || paginationType === 'none'
        ? undefined
        : page ?? 1,
    paginationType: paginationType as 'offset' | 'cursor' | 'none' | undefined,
    after,
    before,
    categoryIds,
    exclude,
    appliesToAll: appliesToAll ?? false,
    or,
  };
}

function optionalQueryBoolean(
  value: unknown,
  field: string,
  issues: string[],
): boolean | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const normalized = value.toLowerCase();
    if (normalized === 'true') {
      return true;
    }
    if (normalized === 'false') {
      return false;
    }
  }

  issues.push(`${field} must be true or false`);
  return undefined;
}

function optionalOrList(
  value: unknown,
  issues: string[],
): Array<'categoryIds' | 'appliesToAll'> | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  const values = Array.isArray(value) ? value : [value];
  const filters = values.flatMap((item) =>
    typeof item === 'string'
      ? item
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean)
      : [item],
  );

  if (filters.length === 0) {
    return undefined;
  }

  const normalizedFilters = filters.map((filter) =>
    filter === 'categoryId' ? 'categoryIds' : filter,
  );

  for (const filter of normalizedFilters) {
    if (filter !== 'categoryIds' && filter !== 'appliesToAll') {
      issues.push('or must contain categoryIds or appliesToAll');
    }
  }

  return Array.from(
    new Set(normalizedFilters as Array<'categoryIds' | 'appliesToAll'>),
  );
}

function optionalExcludeList(
  value: unknown,
  issues: string[],
): Array<'categoryIds'> | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  const values = Array.isArray(value) ? value : [value];
  const excludes = values.flatMap((item) =>
    typeof item === 'string'
      ? item
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean)
      : [item],
  );

  if (excludes.length === 0) {
    return undefined;
  }

  for (const exclude of excludes) {
    if (exclude !== 'categoryIds') {
      issues.push('exclude must be categoryIds');
    }
  }

  return Array.from(new Set(excludes as Array<'categoryIds'>));
}

function optionalUuidList(
  value: unknown,
  field: string,
  issues: string[],
): string[] | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  const values = Array.isArray(value) ? value : [value];
  const ids = values.flatMap((item) =>
    typeof item === 'string'
      ? item
          .split(',')
          .map((part) => part.trim())
          .filter(Boolean)
      : [item],
  );

  if (ids.length === 0) {
    return undefined;
  }

  for (const id of ids) {
    requireUuid(id, field, issues);
  }

  return Array.from(new Set(ids as string[]));
}

export function validateGetParams(value: unknown): { id: string } {
  const params = objectValue(value);
  const issues: string[] = [];
  requireUuid(params.id, 'id', issues);
  throwIfInvalid(issues, throwInvalidRoute);
  return params as unknown as { id: string };
}

export function validateDeleteParams(value: unknown): { id: string } {
  return validateGetParams(value);
}

export function validateUpdateAttributeBody(
  value: unknown,
): UpdateAttributeDto {
  const body = objectValue(value);
  const issues: string[] = [];

  optionalString(body.name, 'name', issues, { min: 2, max: 100 });
  optionalString(body.description, 'description', issues, { max: 255 });
  optionalBoolean(body.isActive, 'isActive', issues);
  optionalBoolean(body.isFilterable, 'isFilterable', issues);
  optionalBoolean(body.appliesToAll, 'appliesToAll', issues);
  optionalBoolean(body.isRequired, 'isRequired', issues);
  validateCategoryIds(body.categoryIds, issues);

  if (body.appliesToAll === false && body.categoryIds === undefined) {
    issues.push(
      'categoryIds is required when appliesToAll is explicitly false',
    );
  }
  if (body.appliesToAll !== true && Array.isArray(body.categoryIds)) {
    if (body.categoryIds.length === 0) {
      issues.push(
        'At least one category must be selected when appliesToAll is false',
      );
    }
  }

  throwIfInvalid(issues, throwInvalidInput);
  return body as unknown as UpdateAttributeDto;
}

export function validateIfMatch(value: unknown): ParsedIfMatch {
  const issues: string[] = [];
  if (typeof value !== 'string' || value.length < 1) {
    issues.push('If-Match header is required');
  }

  const raw = typeof value === 'string' ? value.replace(/^"|"$/g, '') : '';
  const expectedVersion = Number(raw);
  if (value && (!Number.isInteger(expectedVersion) || expectedVersion <= 0)) {
    issues.push('If-Match must be a positive integer version');
  }

  throwIfInvalid(issues, throwInvalidHeaders);
  return { expectedVersion };
}

function validateCategoryIds(value: unknown, issues: string[]) {
  if (value === undefined) {
    return;
  }
  if (!Array.isArray(value)) {
    issues.push('categoryIds must be an array');
    return;
  }
  for (const categoryId of value) {
    if (typeof categoryId !== 'string' || categoryId.length < 1) {
      issues.push('categoryIds must contain strings');
    }
  }
}

function throwInvalidInput(issues: string[]) {
  throw new LegacyHttpException(400, 'Invalid input', { issues });
}

function throwInvalidRoute(issues: string[]) {
  throw new LegacyHttpException(400, 'Invalid route parameters', { issues });
}

function throwInvalidHeaders(issues: string[]) {
  throw new LegacyHttpException(400, 'Invalid headers', { issues });
}


