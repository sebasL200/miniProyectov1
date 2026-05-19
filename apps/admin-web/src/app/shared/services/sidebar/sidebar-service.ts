import { Injectable, signal } from '@angular/core';
import { SideItemType } from '@shared/components';

@Injectable({
  providedIn: 'root',
})
export class SidebarService {
  isOpen = signal<boolean>(false);
  options = signal<SideItemType[]>([]);

  toggle() {
    this.isOpen.update((state) => !state);
  }

  close() {
    this.isOpen.set(false);
  }
}
