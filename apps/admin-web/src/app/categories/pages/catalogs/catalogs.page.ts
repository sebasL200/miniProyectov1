import { Component } from '@angular/core';
import { PageLayout, PageHeader, Card } from '@shared/components';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faBoxes, faCertificate, faLayerGroup, faListCheck, faTableCellsLarge, faTags } from '@fortawesome/free-solid-svg-icons';
import { IconProp } from '@fortawesome/fontawesome-svg-core';

interface CatalogLink {
  label: string;
  icon: IconProp;
  href: string;
}

@Component({
  selector: 'app-catalogs-page',
  standalone: true,
  imports: [PageLayout, PageHeader, Card, RouterLink, FaIconComponent],
  template: `
    <ecom-page-layout>
      <header ecom-page-header title="Catálogos" description="Administración central de los catálogos del sistema."></header>
      
      <main class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        @for (item of options; track item.label) {
          <a [routerLink]="item.href" [title]="item.label">
            <ecom-card class="text-gray-500 transition-all duration-300 ease-in-out hover:cursor-pointer hover:text-primary">
              <div class="flex flex-wrap items-center gap-4 text-sm md:text-base xl:text-xl font-bold p-4">
                <fa-icon [icon]="item.icon"></fa-icon>
                <h2>{{ item.label }}</h2>
              </div>
            </ecom-card>
          </a>
        }
      </main>
    </ecom-page-layout>
  `
})
export class CatalogsPage {
  readonly options: CatalogLink[] = [
    { label: 'Categorías', icon: faTableCellsLarge, href: 'categorias' },
    { label: 'Productos', icon: faBoxes, href: 'productos' },
    { label: 'Marcas', icon: faCertificate, href: 'marcas' },
    { label: 'Variantes de productos', icon: faLayerGroup, href: 'variantes' },
    { label: 'Atributos', icon: faListCheck, href: 'atributos' },
    { label: 'Ofertas', icon: faTags, href: 'ofertas' },
  ];
}
