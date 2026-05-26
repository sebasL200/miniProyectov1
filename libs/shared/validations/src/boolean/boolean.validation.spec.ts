import {
  legacyCoerceBoolean,
  optionalBoolean,
  optionalNullableBoolean,
  requireBoolean,
} from './boolean.validation';

describe('boolean validations', () => {
  it('records an issue when a required boolean is missing or invalid', () => {
    const issues: string[] = [];

    requireBoolean('true', 'isActive', issues);

    expect(issues).toEqual(['isActive must be a boolean']);
  });

  it('accepts optional nullable booleans', () => {
    const issues: string[] = [];

    optionalNullableBoolean(undefined, 'isActive', issues);
    optionalNullableBoolean(null, 'isActive', issues);
    optionalNullableBoolean(false, 'isActive', issues);

    expect(issues).toEqual([]);
  });

  it('accepts optional booleans and rejects invalid present values', () => {
    const issues: string[] = [];

    optionalBoolean(undefined, 'visibleInMenu', issues);
    optionalBoolean(true, 'visibleInMenu', issues);
    optionalBoolean('true', 'visibleInMenu', issues);

    expect(issues).toEqual(['visibleInMenu must be a boolean']);
  });

  it('preserves the legacy boolean coercion behavior', () => {
    expect(legacyCoerceBoolean(undefined)).toBeUndefined();
    expect(legacyCoerceBoolean('')).toBe(false);
    expect(legacyCoerceBoolean('false')).toBe(true);
  });
});
