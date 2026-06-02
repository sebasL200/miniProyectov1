import { Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SideItemType } from '../side-item/side-item.types';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { NavigationEnd, Router } from '@angular/router';
import { SidebarService } from '../../../../services/sidebar/sidebar-service';
import { NgClass } from '@angular/common';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'ecom-side-item-option',
  imports: [FaIconComponent, NgClass],
  templateUrl: './side-item-option.html',
  styleUrl: './side-item-option.css',
})
export class SideItemOption {

  private readonly sidebarService = inject(SidebarService);
  private readonly router = inject(Router);
  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  isOpen = this.sidebarService.isOpen;

  value = input.required<SideItemType>();
  isChild = input<boolean>(false);
  isActive = computed(() => {
    const currentUrl = this.currentUrl();
    return (
      currentUrl === this.value().href
      || currentUrl.startsWith(`${this.value().href}/`)
    );
  });

  navigate(): void {
    this.router.navigateByUrl(this.value().href);
    this.sidebarService.close();
  }
}
