import { TemplateRef } from '@angular/core';
import { SelectOption } from './select-option';

describe('SelectOption', () => {
  it('should create an instance', () => {
    const directive = new SelectOption({} as TemplateRef<unknown>);
    expect(directive).toBeTruthy();
  });
});
