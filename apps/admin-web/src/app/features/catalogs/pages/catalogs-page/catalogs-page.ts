import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageLayout, PageHeader } from '@shared/components';
import { CatalogLinkCardComponent } from '../../components/catalog-link-card/catalog-link-card';
import { CatalogLink } from '../../components/catalog-link-card/catalog-link-card.types';
import { faBoxes, faCertificate, faLayerGroup, faListCheck, faTableCellsLarge, faTags } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-catalogs-page',
  standalone: true,
  imports: [CommonModule, PageLayout, PageHeader, CatalogLinkCardComponent],
  templateUrl: './catalogs-page.html',
  styleUrls: ['./catalogs-page.css']
})
export class CatalogsPageComponent {
  readonly options: CatalogLink[] = [
    { label: 'Categorías', icon: faTableCellsLarge, href: 'categorias' },
    { label: 'Productos', icon: faBoxes, href: 'productos' },
    { label: 'Marcas', icon: faCertificate, href: 'marcas' },
    { label: 'Variantes de productos', icon: faLayerGroup, href: 'variantes' },
    { label: 'Atributos', icon: faListCheck, href: 'atributos' },
    { label: 'Ofertas', icon: faTags, href: 'ofertas' },
  ];
}
