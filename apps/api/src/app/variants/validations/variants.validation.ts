import { NotImplementedException } from '@nestjs/common';
import { CreateVariantDto } from '@org/contracts';
import type { VariantAttributeValueInputDto } from '@org/contracts';
import {
  VariantDimensionsDto,
  VariantPackagingDimensionsDto,
} from '@org/contracts';
import {
  ListVariantsByProductQueryDto,
  ListVariantsQueryDto,
} from '@org/contracts';
import { ToggleVariantStatusDto } from '@org/contracts';
import { UpdateVariantDto } from '@org/contracts';
import {
  objectValue,
  optionalBoolean,
  optionalNumber,
  optionalPlainObject,
  optionalPositiveInt,
  optionalQueryBoolean,
  optionalString,
  optionalStringArray,
  optionalStringValue,
  optionalUuid,
  requireString,
  throwIfInvalid,
} from '@org/validations';
import { LegacyHttpException } from '../../common/http/legacy-http-exception.filter';

export function validateCreateVariantBody(value: unknown): CreateVariantDto {
  const body = objectValue(value);
  const issues: string[] = [];

  requireString(body.productId, 'productId', issues, { min: 1 });
  requireString(body.sku, 'sku', issues, { min: 1 });
  optionalString(body.price, 'price', issues, { min: 1 });
  optionalNumber(body.minimumStock, 'minimumStock', issues);
  optionalString(body.barcodeGtin, 'barcodeGtin', issues);
  optionalString(body.descriptionHtml, 'descriptionHtml', issues);
  optionalBoolean(body.isActive, 'isActive', issues);
  optionalStringArray(body.imageUrls, 'imageUrls', issues);
  optionalStringArray(body.attributeIds, 'attributeIds', issues);
  const attributeValues = parseAttributeValues(body.attributeValues, issues);
  const dimensions = parseVariantDimensions(body.dimensions, issues);

  throwIfInvalid(issues, throwInvalid);

  return {
    productId: String(body.productId),
    sku: String(body.sku),
    price: typeof body.price === 'string' ? body.price : undefined,
    minimumStock: typeof body.minimumStock === 'number' ? body.minimumStock : 0,
    barcodeGtin:
      typeof body.barcodeGtin === 'string' ? body.barcodeGtin : undefined,
    descriptionHtml:
      typeof body.descriptionHtml === 'string'
        ? body.descriptionHtml
        : undefined,
    dimensions,
    isActive: typeof body.isActive === 'boolean' ? body.isActive : false,
    imageUrls: Array.isArray(body.imageUrls)
      ? (body.imageUrls as string[])
      : [],
    attributeIds: Array.isArray(body.attributeIds)
      ? (body.attributeIds as string[])
      : undefined,
    attributeValues,
  };
}

export function validateUpdateVariantBody(value: unknown): UpdateVariantDto {
  const body = objectValue(value);
  const issues: string[] = [];

  optionalString(body.sku, 'sku', issues, { min: 1 });
  optionalString(body.price, 'price', issues, { min: 1 });
  optionalNumber(body.minimumStock, 'minimumStock', issues);
  optionalString(body.barcodeGtin, 'barcodeGtin', issues);
  optionalBoolean(body.clearBarcodeGtin, 'clearBarcodeGtin', issues);
  optionalString(body.descriptionHtml, 'descriptionHtml', issues);
  optionalBoolean(body.clearDescriptionHtml, 'clearDescriptionHtml', issues);
  optionalString(body.offerPrice, 'offerPrice', issues, { min: 1 });
  optionalBoolean(body.clearOfferPrice, 'clearOfferPrice', issues);
  optionalString(body.offerStart, 'offerStart', issues, { min: 1 });
  optionalBoolean(body.clearOfferStart, 'clearOfferStart', issues);
  optionalString(body.offerEnd, 'offerEnd', issues, { min: 1 });
  optionalBoolean(body.clearOfferEnd, 'clearOfferEnd', issues);
  optionalBoolean(body.clearDimensions, 'clearDimensions', issues);
  optionalBoolean(body.isActive, 'isActive', issues);
  optionalStringArray(body.imageUrls, 'imageUrls', issues);
  optionalStringArray(body.attributeIds, 'attributeIds', issues);
  const attributeValues = parseAttributeValues(
    body.attributeValues,
    issues,
    true,
  );
  optionalBoolean(body.replaceImageUrls, 'replaceImageUrls', issues);
  optionalBoolean(body.replaceAttributeIds, 'replaceAttributeIds', issues);
  optionalBoolean(
    body.replaceAttributeValues,
    'replaceAttributeValues',
    issues,
  );
  const dimensions = parseVariantDimensions(body.dimensions, issues);

  throwIfInvalid(issues, throwInvalid);
  return {
    sku: typeof body.sku === 'string' ? body.sku : undefined,
    price: typeof body.price === 'string' ? body.price : undefined,
    minimumStock:
      typeof body.minimumStock === 'number' ? body.minimumStock : undefined,
    barcodeGtin:
      typeof body.barcodeGtin === 'string' ? body.barcodeGtin : undefined,
    clearBarcodeGtin:
      typeof body.clearBarcodeGtin === 'boolean'
        ? body.clearBarcodeGtin
        : undefined,
    descriptionHtml:
      typeof body.descriptionHtml === 'string'
        ? body.descriptionHtml
        : undefined,
    clearDescriptionHtml:
      typeof body.clearDescriptionHtml === 'boolean'
        ? body.clearDescriptionHtml
        : undefined,
    offerPrice:
      typeof body.offerPrice === 'string' ? body.offerPrice : undefined,
    clearOfferPrice:
      typeof body.clearOfferPrice === 'boolean'
        ? body.clearOfferPrice
        : undefined,
    offerStart:
      typeof body.offerStart === 'string' ? body.offerStart : undefined,
    clearOfferStart:
      typeof body.clearOfferStart === 'boolean'
        ? body.clearOfferStart
        : undefined,
    offerEnd: typeof body.offerEnd === 'string' ? body.offerEnd : undefined,
    clearOfferEnd:
      typeof body.clearOfferEnd === 'boolean' ? body.clearOfferEnd : undefined,
    dimensions,
    clearDimensions:
      typeof body.clearDimensions === 'boolean'
        ? body.clearDimensions
        : undefined,
    isActive: typeof body.isActive === 'boolean' ? body.isActive : undefined,
    imageUrls: Array.isArray(body.imageUrls)
      ? (body.imageUrls as string[])
      : undefined,
    attributeIds: Array.isArray(body.attributeIds)
      ? (body.attributeIds as string[])
      : undefined,
    attributeValues,
    replaceImageUrls:
      typeof body.replaceImageUrls === 'boolean'
        ? body.replaceImageUrls
        : undefined,
    replaceAttributeIds:
      typeof body.replaceAttributeIds === 'boolean'
        ? body.replaceAttributeIds
        : undefined,
    replaceAttributeValues:
      typeof body.replaceAttributeValues === 'boolean'
        ? body.replaceAttributeValues
        : undefined,
  };
}

export function validateListVariantsByProductQuery(
  value: unknown,
): ListVariantsByProductQueryDto {
  return validateListVariantsQuery(value);
}

export function validateListVariantsQuery(
  value: unknown,
): ListVariantsQueryDto {
  const query = objectValue(value);
  const issues: string[] = [];
  const paginationType = query.paginationType;

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
  const isActive = optionalQueryBoolean(query.isActive, 'isActive', issues);
  optionalUuid(query.productId, 'productId', issues);

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
    productId: optionalStringValue(query.productId, 'productId', issues),
    isActive,
    pageSize,
    page,
    after,
    before,
  };
}

export function validateVariantIdParams(value: unknown): { id: string } {
  const params = objectValue(value);
  const issues: string[] = [];

  requireString(params.id, 'id', issues, { min: 1 });
  throwIfInvalid(issues, throwInvalid);

  return { id: String(params.id) };
}

export function validateVariantSkuParams(value: unknown): { sku: string } {
  const params = objectValue(value);
  const issues: string[] = [];

  requireString(params.sku, 'sku', issues, { min: 1 });
  throwIfInvalid(issues, throwInvalid);

  return { sku: String(params.sku) };
}

export function validateVariantProductParams(value: unknown): {
  productId: string;
} {
  const params = objectValue(value);
  const issues: string[] = [];

  requireString(params.productId, 'productId', issues, { min: 1 });
  throwIfInvalid(issues, throwInvalid);

  return { productId: String(params.productId) };
}

export function validateToggleVariantStatusInput(
  paramsValue: unknown,
  bodyValue: unknown,
): ToggleVariantStatusDto {
  const params = validateVariantIdParams(paramsValue);
  const body = objectValue(bodyValue);
  const issues: string[] = [];

  if (typeof body.isActive !== 'boolean') {
    issues.push('isActive must be a boolean');
  }

  throwIfInvalid(issues, throwInvalid);

  return {
    id: params.id,
    isActive: body.isActive as boolean,
  };
}

function parseAttributeValues(
  value: unknown,
  issues: string[],
  optional = false,
): VariantAttributeValueInputDto[] | undefined {
  if (value === undefined) {
    return optional ? undefined : [];
  }

  if (!Array.isArray(value)) {
    issues.push('attributeValues must be an array');
    return optional ? undefined : [];
  }

  return value.map((item, index) => {
    const entry = objectValue(item);
    requireString(
      entry.attributeId,
      `attributeValues[${index}].attributeId`,
      issues,
      {
        min: 1,
      },
    );
    requireString(entry.value, `attributeValues[${index}].value`, issues, {
      min: 1,
    });

    return {
      attributeId: String(entry.attributeId ?? ''),
      value: String(entry.value ?? ''),
    };
  });
}

const VARIANT_DIMENSION_FIELDS = [
  'weight',
  'length',
  'width',
  'height',
] as const;
const VARIANT_PACKAGING_FIELDS = ['unit', 'depth', 'width', 'height'] as const;

export function parseVariantDimensions(
  value: unknown,
  issues: string[],
): VariantDimensionsDto | undefined {
  if (value === undefined) {
    return undefined;
  }

  const dimensions = optionalPlainObject(value, 'dimensions', issues);
  if (!dimensions) {
    return undefined;
  }

  if ('weightUnit' in dimensions) {
    issues.push(
      'dimensions.weightUnit is not supported; include the unit in dimensions.weight',
    );
  }

  for (const field of VARIANT_DIMENSION_FIELDS) {
    const fieldValue = dimensions[field];
    if (fieldValue !== undefined && typeof fieldValue !== 'string') {
      issues.push(`dimensions.${field} must be a string`);
    }
  }

  let packaging: VariantPackagingDimensionsDto | undefined;
  if (dimensions['packaging'] !== undefined) {
    const packagingValue = optionalPlainObject(
      dimensions['packaging'],
      'dimensions.packaging',
      issues,
    );

    if (packagingValue) {
      packaging = {};
      for (const field of VARIANT_PACKAGING_FIELDS) {
        const fieldValue = packagingValue[field];

        if (field === 'unit') {
          if (fieldValue !== undefined && typeof fieldValue !== 'string') {
            issues.push('dimensions.packaging.unit must be a string');
          } else if (typeof fieldValue === 'string') {
            packaging.unit = fieldValue;
          }
          continue;
        }

        if (fieldValue !== undefined && typeof fieldValue !== 'number') {
          issues.push(`dimensions.packaging.${field} must be a number`);
        } else if (typeof fieldValue === 'number') {
          packaging[field] = fieldValue;
        }
      }
    }
  }

  const nextDimensions = variantDimensionsFromRecord(dimensions);
  if (packaging) {
    nextDimensions.packaging = packaging;
  }

  return nextDimensions;
}

export function variantDimensionsFromRecord(
  dimensions: Record<string, unknown>,
): VariantDimensionsDto {
  return VARIANT_DIMENSION_FIELDS.reduce<VariantDimensionsDto>((acc, field) => {
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


