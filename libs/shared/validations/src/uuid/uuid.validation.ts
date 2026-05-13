const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function requireUuid(value: unknown, field: string, issues: string[]) {
  if (!isUuid(value)) {
    issues.push(`${field} must be a valid UUID`);
  }
}

export function optionalUuid(value: unknown, field: string, issues: string[]) {
  if (value === undefined || value === '') {
    return;
  }
  requireUuid(value, field, issues);
}
