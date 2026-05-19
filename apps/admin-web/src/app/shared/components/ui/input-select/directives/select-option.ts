import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ecom-select-option]',
})
export class SelectOption {

  constructor(public template: TemplateRef<unknown>) {}
}
