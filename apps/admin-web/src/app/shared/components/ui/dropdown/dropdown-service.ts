import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DropdownService {

  isOpen = signal<boolean>(false);

  close() {
    this.isOpen.set(false);
  }
}
