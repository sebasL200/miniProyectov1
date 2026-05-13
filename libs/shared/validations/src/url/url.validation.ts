export function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return Boolean(parsed.protocol && parsed.pathname !== undefined);
  } catch {
    return false;
  }
}

export function optionalUrlOrEmpty(
  value: unknown,
  field: string,
  issues: string[],
) {
  if (value === undefined) {
    return;
  }
  if (value === '') {
    return;
  }
  if (typeof value !== 'string' || !isValidUrl(value)) {
    issues.push(`${field} must be a valid URL`);
  }
}
