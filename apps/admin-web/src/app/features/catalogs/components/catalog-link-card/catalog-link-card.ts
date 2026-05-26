import { Component, input } from '@angular/core';
import { Card } from "@shared/components";
import { RouterLink } from "@angular/router";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { IconProp } from '@fortawesome/fontawesome-svg-core';

@Component({
  selector: 'ecom-catalog-link-card',
  imports: [Card, RouterLink, FaIconComponent],
  templateUrl: './catalog-link-card.html',
  styleUrl: './catalog-link-card.css',
})
export class CatalogLinkCard {
  label = input.required<string>();
  href = input.required<string>();
  icon = input.required<IconProp>();
}
