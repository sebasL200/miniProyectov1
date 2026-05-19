import { Component, output } from '@angular/core';

@Component({
  selector: 'ecom-dropdown-trigger',
  imports: [],
  templateUrl: './dropdown-trigger.html',
  styleUrl: './dropdown-trigger.css',
  host: {
    '(click)': 'toggle.emit()',
  },
})
export class DropdownTrigger {
  toggle = output<void>();
}
