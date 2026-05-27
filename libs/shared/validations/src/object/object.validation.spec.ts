import { objectValue, optionalPlainObject } from './object.validation.js';

describe('object validations', () => {
  it('returns record values as-is', () => {
    const value = { name: 'Brand' };

    expect(objectValue(value)).toBe(value);
  });

  it('normalizes non-object values to an empty record', () => {
    expect(objectValue(null)).toEqual({});
    expect(objectValue('value')).toEqual({});
  });

  it('validates optional plain objects', () => {
    const issues: string[] = [];

    expect(optionalPlainObject({ name: 'Brand' }, 'payload', issues)).toEqual({
      name: 'Brand',
    });
    expect(optionalPlainObject(undefined, 'payload', issues)).toBeUndefined();
    expect(optionalPlainObject([], 'payload', issues)).toBeUndefined();

    expect(issues).toEqual(['payload must be an object']);
  });
});
