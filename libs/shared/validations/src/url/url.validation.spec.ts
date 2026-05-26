import { isValidUrl, optionalUrlOrEmpty } from './url.validation';

describe('url validations', () => {
  it('accepts absolute URLs', () => {
    expect(isValidUrl('https://example.com/logo.png')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('rejects empty and relative URLs', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('/logo.png')).toBe(false);
    expect(isValidUrl('example.com/logo.png')).toBe(false);
  });

  it('allows optional empty URL fields', () => {
    const issues: string[] = [];

    optionalUrlOrEmpty(undefined, 'website', issues);
    optionalUrlOrEmpty('', 'website', issues);
    optionalUrlOrEmpty('/relative', 'website', issues);

    expect(issues).toEqual(['website must be a valid URL']);
  });
});
