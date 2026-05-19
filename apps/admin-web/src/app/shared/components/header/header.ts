import { Component, computed, inject } from '@angular/core';
import { Button } from '../ui';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faArrowRightFromBracket, faBars } from '@fortawesome/free-solid-svg-icons';
import { SidebarService } from '@shared/services/sidebar/sidebar-service';
import { SearchBar } from '../ui/search-bar/search-bar';
import { Slot } from '@shared/directives/slot/slot';
import { Dropdown } from '../ui/dropdown/dropdown';
import { DropdownTrigger } from '../ui/dropdown/components/dropdown-trigger/dropdown-trigger';
import { DropdownContent } from '../ui/dropdown/components/dropdown-content/dropdown-content';
import { DropdownGroup } from '../ui/dropdown/components/dropdown-group/dropdown-group';
import { DropdownItem } from '../ui/dropdown/components/dropdown-item/dropdown-item';
import { Router } from '@angular/router';

@Component({
    selector: 'header[ecom-header]',
    imports: [
        Button,
        FaIconComponent,
        SearchBar,
        Slot,
        Dropdown,
        DropdownTrigger,
        DropdownContent,
        DropdownGroup,
        DropdownItem,
    ],
    templateUrl: './header.html',
    styleUrl: './header.css',
    host: {
        class: 'flex items-center justify-between px-6 h-16 bg-card border-b border-border',
    },
})
export class Header {
    private readonly router: Router = inject(Router);
    private readonly sidebarService: SidebarService = inject(SidebarService);

    currentUser = computed(() => ({ name: 'Samuel Morales Navarro' }));
    firstLetterOfUserName = computed(() => this.currentUser()?.name.charAt(0).toUpperCase() || '');
    rol = computed(() => 'Administrador');
    
    faBars = faBars;
    faArrowRightFromBracket = faArrowRightFromBracket;

    toggleSidebar() {
        this.sidebarService.toggle();
    }

    onSearch(value: string) {
        console.log('Search value:', value);
    }

    onLogout() {
        // No-op for this test environment bypass
        this.router.navigate(['/']);
    }
}
