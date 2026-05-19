import { Directive, input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[ecom-cell-template]',
})
export class CellTemplate {
  cellTemplate = input.required<string>({ alias: 'template' });

  constructor(public template: TemplateRef<any>) {}
}
