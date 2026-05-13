export type StringValidationOptions = {
  min?: number;
  max?: number;
};

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 160;
export const PASSWORD_COMPLEXITY_PATTERN =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/u;
export const PASSWORD_COMPLEXITY_ISSUE =
  'must contain at least one uppercase letter, one number, and one special character';

export function requireString(
  value: unknown,
  field: string,
  issues: string[],
  options: StringValidationOptions = {},
) {
  if (typeof value !== 'string') {
    issues.push(`${field} must be a string`);
    return;
  }
  validateStringLength(value, field, issues, options);
}

export function optionalString(
  value: unknown,
  field: string,
  issues: string[],
  options: StringValidationOptions = {},
) {
  if (value === undefined) {
    return;
  }
  if (typeof value !== 'string') {
    issues.push(`${field} must be a string`);
    return;
  }
  validateStringLength(value, field, issues, options);
}

export function optionalNullableString(
  value: unknown,
  field: string,
  issues: string[],
  options: StringValidationOptions = {},
) {
  if (value === null) {
    return;
  }
  optionalString(value, field, issues, options);
}

export function optionalStringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value !== '' ? value : undefined;
}

export function optionalTrimmedStringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined;
}

export function hasPasswordComplexity(value: string): boolean {
  return PASSWORD_COMPLEXITY_PATTERN.test(value);
}

export function requirePasswordComplexity(
  value: unknown,
  field: string,
  issues: string[],
) {
  if (typeof value !== 'string') {
    issues.push(`${field} must be a string`);
    return;
  }

  if (!hasPasswordComplexity(value)) {
    issues.push(`${field} ${PASSWORD_COMPLEXITY_ISSUE}`);
  }
}

function validateStringLength(
  value: string,
  field: string,
  issues: string[],
  options: StringValidationOptions,
) {
  if (options.min !== undefined && value.length < options.min) {
    issues.push(`${field} is required`);
  }
  if (options.max !== undefined && value.length > options.max) {
    issues.push(`${field} must be at most ${options.max} characters`);
  }
}
