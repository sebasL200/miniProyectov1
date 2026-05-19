import { Component, viewChildren } from '@angular/core';
import { Slot } from '@shared/directives/slot/slot';

@Component({
  selector: 'ecom-card',
  imports: [],
  templateUrl: './card.html',
  styleUrl: './card.css',
  host: {
    class: 'flex flex-col p-4 rounded-lg shadow-sm bg-white',
  },
})
export class Card {

  slots = viewChildren<Slot>(Slot);

  hasSlot(name: string): boolean {
    return this.slots().some((slot) => slot.slot() === name);
  }
}
