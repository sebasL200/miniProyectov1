export function requireBoolean(
  value: unknown,
  field: string,
  issues: string[],
) {
  if (typeof value !== 'boolean') {
    issues.push(`${field} must be a boolean`);
  }
}

export function optionalNullableBoolean(
  value: unknown,
  field: string,
  issues: string[],
) {
  if (value === undefined || value === null) {
    return;
  }
  if (typeof value !== 'boolean') {
    issues.push(`${field} must be a boolean`);
  }
}

export function optionalBoolean(
  value: unknown,
  field: string,
  issues: string[],
) {
  if (value === undefined) {
    return;
  }
  requireBoolean(value, field, issues);
}

export function legacyCoerceBoolean(value: unknown): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }
  return Boolean(value);
}

export function optionalQueryBoolean(
  value: unknown,
  field: string,
  issues: string[],
): boolean | undefined {
  if (value === undefined || value === '') return undefined;
  if (value === 'true' || value === true) return true;
  if (value === 'false' || value === false) return false;
  issues.push(`${field} must be a boolean`);
  return undefined;
}
