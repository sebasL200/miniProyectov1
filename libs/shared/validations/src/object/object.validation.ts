export function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object'
    ? (value as Record<string, unknown>)
    : {};
}

export function optionalPlainObject(
  value: unknown,
  field: string,
  issues: string[],
): Record<string, unknown> | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    issues.push(`${field} must be an object`);
    return undefined;
  }

  return value as Record<string, unknown>;
}
