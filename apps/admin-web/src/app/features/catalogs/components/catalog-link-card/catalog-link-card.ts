import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { Card } from '@shared/components';
import { CatalogLink } from './catalog-link-card.types';

@Component({
  selector: 'app-catalog-link-card',
  standalone: true,
  imports: [Card, RouterLink, FaIconComponent],
  templateUrl: './catalog-link-card.html',
  styleUrls: ['./catalog-link-card.css']
})
export class CatalogLinkCardComponent {
  @Input({ required: true }) item!: CatalogLink;
}
