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
  faTableCellsLarge,
  faUser,
  faWarehouse,
} from '@fortawesome/free-solid-svg-icons';
import { NgClass } from '@angular/common';
import { Header } from '@shared/components/header/header';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'ecom-main-layout',
  standalone: true,
  imports: [Sidebar, NgClass, Header, RouterOutlet],
  template: `
    <div class="relative h-screen max-h-screen overflow-hidden">
      <ecom-sidebar></ecom-sidebar>
      <div
        class="flex flex-col h-screen ml-72 transition-all ease-in-out duration-300"
        [ngClass]="{
          'ml-72': isOpenSidebar(),
          'ml-24': !isOpenSidebar(),
        }"
      >
        <header ecom-header></header>
        <main class="flex-1 min-h-0 overflow-y-auto bg-primary-background">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
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
        label: 'Catálogos',
        href: '/catalogos',
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
