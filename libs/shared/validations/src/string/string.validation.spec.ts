import {
  hasPasswordComplexity,
  optionalNullableString,
  optionalString,
  optionalStringValue,
  optionalTrimmedStringValue,
  requirePasswordComplexity,
  requireString,
} from './string.validation';

describe('string validations', () => {
  it('records required string and length issues', () => {
    const issues: string[] = [];

    requireString(undefined, 'name', issues);
    requireString('', 'name', issues, { min: 1 });
    requireString('abcdef', 'name', issues, { max: 3 });

    expect(issues).toEqual([
      'name must be a string',
      'name is required',
      'name must be at most 3 characters',
    ]);
  });

  it('validates optional and nullable strings', () => {
    const issues: string[] = [];

    optionalString(undefined, 'description', issues);
    optionalNullableString(null, 'description', issues);
    optionalString(123, 'description', issues);

    expect(issues).toEqual(['description must be a string']);
  });

  it('extracts optional string values', () => {
    expect(optionalStringValue('Brand')).toBe('Brand');
    expect(optionalStringValue('')).toBeUndefined();
    expect(optionalTrimmedStringValue(' Brand ')).toBe('Brand');
    expect(optionalTrimmedStringValue('   ')).toBeUndefined();
  });

  it('validates password complexity requirements', () => {
    const issues: string[] = [];

    requirePasswordComplexity('plainpassword', 'password', issues);

    expect(hasPasswordComplexity('Abcd1234!')).toBe(true);
    expect(hasPasswordComplexity('plainpassword')).toBe(false);
    expect(issues).toEqual([
      'password must contain at least one uppercase letter, one number, and one special character',
    ]);
  });
});
