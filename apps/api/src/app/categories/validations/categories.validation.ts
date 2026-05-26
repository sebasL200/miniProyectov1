import { BadRequestException } from '@nestjs/common';
import {
  CreateBatchCategoryDto,
  CreateCategoryDto,
  ListCategoriesQueryDto,
  SyncCategoryChildrenDto,
  UpdateCategoryDto,
} from '@org/contracts';
import {
  legacyCoerceBoolean,
  objectValue,
  optionalBoolean,
  optionalPositiveInt,
  optionalString,
  optionalStringValue,
  optionalTrimmedStringValue,
  optionalUuid,
  requireBoolean,
  requireString,
  requireUuid,
  throwIfInvalid,
} from '@org/validations';

export function validateCreateCategoryBody(value: unknown): CreateCategoryDto {
  const body = objectValue(value);
  const issues: string[] = [];

  requireString(body.name, 'name', issues, { min: 1, max: 125 });
  optionalUuid(body.parentId, 'parentId', issues);
  optionalString(body.description, 'description', issues, { max: 125 });
  optionalString(body.imageUrl, 'imageUrl', issues);
  optionalString(body.metaTitle, 'metaTitle', issues, { max: 125 });
  optionalString(body.metaDescription, 'metaDescription', issues, { max: 125 });
  requireBoolean(body.isActive, 'isActive', issues);
  requireBoolean(body.visibleInMenu, 'visibleInMenu', issues);

  throwInvalid(issues);
  return body as unknown as CreateCategoryDto;
}

export function validateUpdateCategoryBody(value: unknown): UpdateCategoryDto {
  const body = objectValue(value);
  const issues: string[] = [];

  optionalString(body.name, 'name', issues, { min: 1, max: 125 });
  optionalUuid(body.parentId, 'parentId', issues);
  optionalString(body.description, 'description', issues, { max: 125 });
  optionalString(body.imageUrl, 'imageUrl', issues);
  optionalString(body.metaTitle, 'metaTitle', issues, { max: 125 });
  optionalString(body.metaDescription, 'metaDescription', issues, { max: 125 });
  optionalBoolean(body.isActive, 'isActive', issues);
  optionalBoolean(body.visibleInMenu, 'visibleInMenu', issues);

  throwInvalid(issues);
  return body as unknown as UpdateCategoryDto;
}

export function validateCreateBatchBody(value: unknown): {
  categories: CreateBatchCategoryDto[];
} {
  const body = objectValue(value);
  const issues: string[] = [];

  if (!Array.isArray(body.categories)) {
    issues.push('categories must be an array');
  } else {
    const seen = new Map<string, string>();
    for (const item of body.categories) {
      const category = objectValue(item);
      if (typeof category.key !== 'string' || category.key.length < 1) {
        issues.push('key is required');
      }
      collectCreateIssues(category, issues);
      if (typeof category.name === 'string') {
        const previousKey = seen.get(category.name);
        if (previousKey) {
          issues.push(
            `Duplicate name for keys ${previousKey} and ${String(category.key)}`,
          );
        }
        seen.set(category.name, String(category.key));
      }
    }
  }

  throwInvalid(issues);
  return body as unknown as { categories: CreateBatchCategoryDto[] };
}

export function validateListCategoriesQuery(
  value: unknown,
): ListCategoriesQueryDto {
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

  optionalUuid(query.parentId, 'parentId', issues);
  if (
    paginationType !== undefined &&
    paginationType !== 'offset' &&
    paginationType !== 'cursor'
  ) {
    issues.push('paginationType must be offset or cursor');
  }

  const after = optionalStringValue(query.after);
  const before = optionalStringValue(query.before);
  const searchQuery = optionalTrimmedStringValue(query.query);

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

  throwInvalid(issues);
  return {
    parentId: optionalStringValue(query.parentId),
    pageSize,
    page,
    rootOnly: legacyCoerceBoolean(query.rootOnly) ?? false,
    query: searchQuery,
    paginationType: paginationType as 'offset' | 'cursor' | undefined,
    after,
    before,
  };
}

export function validateGetParams(value: unknown): { id: string } {
  const params = objectValue(value);
  const issues: string[] = [];
  requireUuid(params.id, 'id', issues);
  throwInvalid(issues);
  return params as unknown as { id: string };
}

export function validateGetQuery(value: unknown): { include?: 'children' } {
  const query = objectValue(value);
  const issues: string[] = [];
  if (
    query.include !== undefined &&
    query.include !== '' &&
    query.include !== 'children'
  ) {
    issues.push('include must be children');
  }
  throwInvalid(issues);
  return {
    include: query.include === 'children' ? 'children' : undefined,
  };
}

export function validateDeleteParams(value: unknown): { id: string } {
  const params = objectValue(value);
  const issues: string[] = [];
  requireUuid(params.id, 'id', issues);
  throwInvalid(issues);
  return params as unknown as { id: string };
}

export function validateSyncChildrenInput(
  paramsValue: unknown,
  bodyValue: unknown,
): SyncCategoryChildrenDto {
  const params = validateGetParams(paramsValue);
  const body = objectValue(bodyValue);
  const issues: string[] = [];

  if (!Array.isArray(body.newCategories)) {
    issues.push('newCategories must be an array');
  } else {
    for (const item of body.newCategories) {
      const category = objectValue(item);
      if (typeof category.key !== 'string' || category.key.length < 1) {
        issues.push('key is required');
      }
      collectCreateIssues(category, issues);
    }
  }

  if (!Array.isArray(body.updateCategories)) {
    issues.push('updateCategories must be an array');
  } else {
    for (const item of body.updateCategories) {
      const update = objectValue(item);
      requireUuid(update.id, 'id', issues);
      validateUpdateCategoryBody(update.changes ?? {});
    }
  }

  if (!Array.isArray(body.deleteCategories)) {
    issues.push('deleteCategories must be an array');
  }

  throwInvalid(issues);
  return {
    id: params.id,
    newCategories:
      body.newCategories as SyncCategoryChildrenDto['newCategories'],
    updateCategories:
      body.updateCategories as SyncCategoryChildrenDto['updateCategories'],
    deleteCategories: body.deleteCategories as string[],
  };
}

function collectCreateIssues(body: Record<string, unknown>, issues: string[]) {
  requireString(body.name, 'name', issues, { min: 1, max: 125 });
  optionalUuid(body.parentId, 'parentId', issues);
  optionalString(body.description, 'description', issues, { max: 125 });
  optionalString(body.imageUrl, 'imageUrl', issues);
  optionalString(body.metaTitle, 'metaTitle', issues, { max: 125 });
  optionalString(body.metaDescription, 'metaDescription', issues, {
    max: 125,
  });
  requireBoolean(body.isActive, 'isActive', issues);
  requireBoolean(body.visibleInMenu, 'visibleInMenu', issues);
}

function throwInvalid(issues: string[]) {
  throwIfInvalid(issues, () => {
    throw new BadRequestException('Invalid input');
  });
}
