import { Component, inject, input } from '@angular/core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { DropdownService } from '../../dropdown-service';

@Component({
  selector: 'ecom-dropdown-item',
  imports: [FaIconComponent],
  templateUrl: './dropdown-item.html',
  styleUrl: './dropdown-item.css',
  host: {
    class: 'flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 cursor-pointer',
    '(click)': 'onClick()',
  }
})
export class DropdownItem {

  dropdownService = inject(DropdownService);

  label = input<string>('');
  icon = input<IconProp | undefined>();


  protected onClick() {
    this.dropdownService.close();
  }
}
