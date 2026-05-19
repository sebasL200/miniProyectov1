import { Directive, input } from '@angular/core';

@Directive({
  selector: '[slot]',
})
export class Slot {
  constructor() {}

  slot = input.required<string>();
}
