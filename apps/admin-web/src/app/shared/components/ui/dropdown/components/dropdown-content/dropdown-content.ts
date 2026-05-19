import { Component, computed, contentChildren, effect, inject } from '@angular/core';
import { DropdownService } from '../../dropdown-service';
import { DropdownGroup } from '../dropdown-group/dropdown-group';

@Component({
  selector: 'ecom-dropdown-content',
  imports: [],
  templateUrl: './dropdown-content.html',
  styleUrl: './dropdown-content.css',
  host: {
    class:
      'absolute right-0 top-10 z-50 mt-2 bg-white rounded-md shadow-lg origin-top-right transition-all duration-200',
    '[class]': 'hiddenClasses()',
  },
})
export class DropdownContent {
  private readonly dropdownService = inject(DropdownService);

  groups = contentChildren(DropdownGroup);

  isOpen = this.dropdownService.isOpen;

  hiddenClasses = computed(() => {
    if (this.isOpen()) {
      return '';
    }
    return 'opacity-0 pointer-events-none scale-y-0';
  });


  constructor() {
    effect(() => {
      const groups = this.groups();
      groups.forEach((group, index) => {
        group.isLast = index === groups.length - 1;
      })
    })
  }
}
