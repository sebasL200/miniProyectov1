export function requireNumber(
  value: unknown,
  field: string,
  issues: string[],
): number | undefined {
  const parsed = optionalNumber(value, field, issues);

  if (parsed === undefined) {
    issues.push(`${field} is required`);
  }

  return parsed;
}

export function optionalNumber(
  value: unknown,
  field: string,
  issues: string[],
): number | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== 'number' || Number.isNaN(value)) {
    issues.push(`${field} must be a number`);
    return undefined;
  }

  return value;
}

export function optionalPositiveInt(
  value: unknown,
  field: string,
  issues: string[],
  max?: number,
): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    issues.push(`${field} must be a positive integer`);
    return undefined;
  }
  if (max !== undefined && parsed > max) {
    issues.push(`${field} must be at most ${max}`);
    return undefined;
  }
  return parsed;
}
