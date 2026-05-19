import { FormControl } from '@angular/forms';
import { buildPasswordValidators } from './password-form-control.util';

describe('buildPasswordValidators', () => {
  it('requires complexity by default', () => {
    const control = new FormControl('plainpassword', {
      nonNullable: true,
      validators: buildPasswordValidators(),
    });

    expect(control.hasError('pattern')).toBe(true);
  });

  it('can skip complexity when configured', () => {
    const control = new FormControl('plainpassword', {
      nonNullable: true,
      validators: buildPasswordValidators({
        requireComplexity: false,
      }),
    });

    expect(control.hasError('pattern')).toBe(false);
  });
});
