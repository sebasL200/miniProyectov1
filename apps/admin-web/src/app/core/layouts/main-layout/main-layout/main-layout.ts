import { Component, inject, OnInit } from '@angular/core';
import { Sidebar } from '@shared/components/sidebar/sidebar';
import { SidebarService } from '@shared/services/sidebar/sidebar-service';
import {
  faBagShopping,
  faBasketShopping,
  faBookOpen,
  faBoxes,
  faCircleDollarToSlot,
  faFileLines,
  faLock,
  faSwatchbook,
  faTableCellsLarge,
  faUser,
  faWarehouse,
} from '@fortawesome/free-solid-svg-icons';
import { NgClass } from '@angular/common';
import { Header } from '@shared/components/header/header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'ecom-main-layout',
  imports: [Sidebar, NgClass, Header, RouterOutlet],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  host: {
    class: '',
  },
  providers: [SidebarService],
})
export class MainLayout implements OnInit {
  sidebarService: SidebarService = inject(SidebarService);

  isOpenSidebar = this.sidebarService.isOpen;

  toggleSidebar = () => this.sidebarService.toggle();

  ngOnInit(): void {
    this.sidebarService.options.set([
      {
        label: 'Inicio',
        href: '/',
        icon: faTableCellsLarge,
      },
      {
        label: 'Administración del sitio',
        href: '/admin',
        icon: faSwatchbook,
        childrens: [
          {
            label: 'Banners',
            href: '/admin/banners',
          },
          {
            label: 'Contenido destacado',
            href: '/admin/featured-content',
          },
          {
            label: 'Páginas estáticas',
            href: '/admin/static-pages',
          },
          {
            label: 'Footer de sitio',
            href: '/admin/footer',
          },
          {
            label: 'Historial de cambios',
            href: '/admin/changelog',
          },
        ],
      },
      {
        label: 'Catálogos',
        href: '/catalogs',
        icon: faBookOpen,
      },
      {
        label: 'Inventario',
        href: '/inventory',
        icon: faBoxes,
      },
      {
        label: 'Ordenes y ventas',
        href: '/customers',
        icon: faBasketShopping,
      },
      {
        label: 'Pagos',
        href: '/payments',
        icon: faCircleDollarToSlot,
      },
      {
        label: 'Usuarios',
        href: '/users',
        icon: faUser,
      },
      {
        label: 'Soporte y postventa',
        href: '/support',
        icon: faBagShopping,
      },
      {
        label: 'Configuración de la tienda',
        href: '/settings',
        icon: faWarehouse,
      },
      {
        label: 'Seguridad y auditoría',
        href: '/security',
        icon: faLock,
      },
      {
        label: 'Reportes',
        href: '/reports',
        icon: faFileLines,
      },
    ]);
  }
}
