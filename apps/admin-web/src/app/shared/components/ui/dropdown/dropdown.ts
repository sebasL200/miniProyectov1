import { AfterContentInit, Component, contentChild, inject } from '@angular/core';
import { DropdownTrigger } from './components/dropdown-trigger/dropdown-trigger';
import { DropdownService } from './dropdown-service';

@Component({
  selector: 'ecom-dropdown',
  imports: [],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
  host: {
    class: 'relative inline-block text-left',
  },
  providers: [DropdownService],
})
export class Dropdown implements AfterContentInit {

  dropdownService: DropdownService = inject(DropdownService);

  trigger = contentChild(DropdownTrigger);

  isOpen = this.dropdownService.isOpen;

  ngAfterContentInit(): void {
    this.trigger()?.toggle.subscribe(() => {
      this.isOpen.update(isOpen => !isOpen);
    })
  }
}
