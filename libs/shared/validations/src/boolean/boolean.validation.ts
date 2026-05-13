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
