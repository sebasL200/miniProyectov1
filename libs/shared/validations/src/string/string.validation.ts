export function requireString(
  value: unknown,
  field: string,
  issues: string[],
  options?: { min?: number; max?: number },
): string | undefined {
  const parsed = optionalString(value, field, issues, options);

  if (parsed === undefined) {
    if (value === undefined || value === null || value === '') {
      issues.push(`${field} is required`);
    }
  }

  return parsed;
}

export function optionalString(
  value: unknown,
  field: string,
  issues: string[],
  options?: { min?: number; max?: number },
): string | undefined {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (typeof value !== 'string') {
    issues.push(`${field} must be a string`);
    return undefined;
  }

  if (options?.min !== undefined && value.length < options.min) {
    issues.push(`${field} must be at least ${options.min} characters`);
  }

  if (options?.max !== undefined && value.length > options.max) {
    issues.push(`${field} must be at most ${options.max} characters`);
  }

  return value;
}

export function optionalStringValue(
  value: unknown,
  field: string,
  issues: string[],
): string | undefined {
  return optionalString(value, field, issues);
}

export function optionalTrimmedStringValue(
  value: unknown,
  field: string,
  issues: string[],
): string | undefined {
  const parsed = optionalString(value, field, issues);
  return parsed ? parsed.trim() : undefined;
}

export function optionalNullableString(
  value: unknown,
  field: string,
  issues: string[],
  options?: { min?: number; max?: number },
): string | null | undefined {
  if (value === null) {
    return null;
  }
  return optionalString(value, field, issues, options);
}
