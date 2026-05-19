import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { SideItemType } from '../side-item/side-item.types';
import { NgClass } from '@angular/common';
import { SidebarService } from '@shared/services/sidebar/sidebar-service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { SideItemOption } from '../side-item-option/side-item-option';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'ecom-side-item-group',
  imports: [NgClass, FaIconComponent, SideItemOption],
  templateUrl: './side-item-group.html',
  styleUrl: './side-item-group.css',
  host: {
    '[class.bg-primary/20]': 'isActive()',
    '[class.text-primary]': 'isActive()',
    '[class.hover:bg-primary-background]': '!isActive()',
    class: 'block',
  },
})
export class SideItemGroup {
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

  value = input.required<SideItemType>();
  isOpenGroup = signal<boolean>(false);
  faChevronDown = faChevronDown;

  isOpenSidebar = this.sidebarService.isOpen;

  isActive = computed(() => {
    const currentUrl = this.currentUrl();
    return (
      currentUrl === this.value().href
      || currentUrl.startsWith(`${this.value().href}/`)
    );
  });

  toggleOpenGroup() {
    if (!this.isOpenSidebar()) {
      this.sidebarService.toggle();
    }
    this.isOpenGroup.update((state) => !state);
  }

  activatedRouteClass = computed(() => {
    const isActive = this.isActive();
    if (isActive) {
      return 'bg-primary/20 text-primary';
    }
    return 'hover:bg-primary-background';
  });

  constructor() {
    effect(() => {
      if (this.isOpenSidebar() === false) {
        this.isOpenGroup.set(false);
      }
    });

    effect(() => {
      if (this.isOpenSidebar() && this.isActive()) {
        this.isOpenGroup.set(true);
      }
    });
  }
}
