import {
  optionalNumber,
  optionalPositiveInt,
  requireNumber,
} from './number.validation';

describe('number validations', () => {
  it('records issues for required and optional numbers', () => {
    const issues: string[] = [];

    requireNumber(undefined, 'price', issues);
    optionalNumber('12', 'price', issues);

    expect(issues).toEqual([
      'price is required',
      'price must be a number',
    ]);
  });

  it('parses positive integers and supports a maximum', () => {
    const issues: string[] = [];

    expect(optionalPositiveInt('12', 'pageSize', issues, 50)).toBe(12);

    expect(issues).toEqual([]);
  });

  it('records issues for invalid positive integers', () => {
    const issues: string[] = [];

    expect(optionalPositiveInt('0', 'page', issues)).toBeUndefined();
    expect(optionalPositiveInt('51', 'pageSize', issues, 50)).toBeUndefined();

    expect(issues).toEqual([
      'page must be a positive integer',
      'pageSize must be at most 50',
    ]);
  });
});
