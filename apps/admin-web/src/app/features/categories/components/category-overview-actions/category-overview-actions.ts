import { Component, input, output } from '@angular/core';
import { RegisterCategoryStrategy } from './types';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { StatCard, Button } from "@shared/components";
import { Dropdown } from "@shared/components/ui/dropdown/dropdown";
import { DropdownTrigger } from "@shared/components/ui/dropdown/components/dropdown-trigger/dropdown-trigger";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { DropdownContent } from "@shared/components/ui/dropdown/components/dropdown-content/dropdown-content";
import { DropdownGroup } from "@shared/components/ui/dropdown/components/dropdown-group/dropdown-group";
import { DropdownItem } from "@shared/components/ui/dropdown/components/dropdown-item/dropdown-item";

@Component({
    selector: 'ecom-category-overview-actions',
    imports: [StatCard, Dropdown, DropdownTrigger, Button, FaIconComponent, DropdownContent, DropdownGroup, DropdownItem],
    templateUrl: './category-overview-actions.html',
    styleUrl: './category-overview-actions.css',
    host: {
        class: 'flex items-center justify-between',
    },
})
export class CategoryOverviewActions {
    totalCount = input.required<number>();
    creationRequest = output<RegisterCategoryStrategy>();

    readonly faChevronDown = faChevronDown;

    onSingleBrandCreationRequest(): void {
        this.creationRequest.emit('single');
    }

    onMultipleBrandCreationRequest(): void {
        this.creationRequest.emit('multiple');
    }
}
