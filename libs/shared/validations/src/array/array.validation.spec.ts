import {
  optionalStringArray,
  requireStringArray,
} from './array.validation.js';

describe('array validations', () => {
  it('validates optional and required string arrays', () => {
    const issues: string[] = [];

    expect(optionalStringArray(['a', 'b'], 'ids', issues)).toEqual(['a', 'b']);
    expect(optionalStringArray(undefined, 'ids', issues)).toBeUndefined();
    expect(optionalStringArray([1], 'ids', issues)).toBeUndefined();
    expect(requireStringArray(undefined, 'ids', issues)).toBeUndefined();

    expect(issues).toEqual([
      'ids must contain strings',
      'ids is required',
    ]);
  });
});
