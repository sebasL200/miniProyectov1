import { throwIfInvalid } from './error.validation.js';
import { vi } from 'vitest';

describe('error validations', () => {
  it('throws through the provided invalid handler when issues exist', () => {
    const throwInvalid = vi.fn((issues: string[]) => {
      throw new Error(issues.join(','));
    });

    expect(() => throwIfInvalid(['name is required'], throwInvalid)).toThrow(
      'name is required',
    );
    expect(throwInvalid).toHaveBeenCalledWith(['name is required']);
  });

  it('does not call the invalid handler when there are no issues', () => {
    const throwInvalid = vi.fn();

    throwIfInvalid([], throwInvalid);

    expect(throwInvalid).not.toHaveBeenCalled();
  });
});
