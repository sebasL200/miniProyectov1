export function optionalStringArray(
  value: unknown,
  field: string,
  issues: string[],
): string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (!Array.isArray(value)) {
    issues.push(`${field} must be an array`);
    return undefined;
  }

  for (const item of value) {
    if (typeof item !== 'string') {
      issues.push(`${field} must contain strings`);
      return undefined;
    }
  }

  return value;
}

export function requireStringArray(
  value: unknown,
  field: string,
  issues: string[],
): string[] | undefined {
  const parsed = optionalStringArray(value, field, issues);

  if (parsed === undefined) {
    issues.push(`${field} is required`);
  }

  return parsed;
}
