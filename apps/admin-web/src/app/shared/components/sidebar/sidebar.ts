import { Component, inject } from '@angular/core';
import { SideItem } from './components/side-item/side-item';
import { SidebarService } from '../../services/sidebar/sidebar-service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'ecom-sidebar',
  imports: [SideItem, NgClass],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  private sidebarService: SidebarService = inject(SidebarService);

  isOpen = this.sidebarService.isOpen;

  options = this.sidebarService.options;

  toggle = () => this.sidebarService.toggle();

}
