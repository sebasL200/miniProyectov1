import { Component, input } from '@angular/core';
import { Card } from "../ui";

@Component({
  selector: 'ecom-stat-card',
  imports: [Card],
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
  host: {
    class: 'text-primary'
  }
})
export class StatCard {

  label = input<string>('Total de registros');
  value = input<number>(0);
}
