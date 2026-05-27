import { FormControl } from '@angular/forms';
import { urlValidator } from './url-validator';

describe('urlValidator', () => {
  it('accepts empty values for optional controls', () => {
    expect(urlValidator(new FormControl(''))).toBeNull();
    expect(urlValidator(new FormControl(null))).toBeNull();
  });

  it('accepts valid http and https urls', () => {
    expect(urlValidator(new FormControl('https://example.com'))).toBeNull();
    expect(urlValidator(new FormControl('http://example.com/path'))).toBeNull();
  });

  it('rejects malformed or unsupported urls', () => {
    expect(urlValidator(new FormControl('ftp://example.com'))).toEqual({
      invalidUrl: true,
    });
    expect(urlValidator(new FormControl('not-a-url'))).toEqual({
      invalidUrl: true,
    });
  });
});
