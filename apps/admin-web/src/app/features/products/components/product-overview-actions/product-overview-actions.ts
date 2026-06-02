import { Component, input, output } from '@angular/core';
import { StatCard } from '../../../../shared/components/stat-card/stat-card';
import { Button } from '../../../../shared/components/ui/button/button';
import { Dropdown } from '../../../../shared/components/ui/dropdown/dropdown';
import { DropdownTrigger } from '../../../../shared/components/ui/dropdown/components/dropdown-trigger/dropdown-trigger';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DropdownContent } from '../../../../shared/components/ui/dropdown/components/dropdown-content/dropdown-content';
import { DropdownGroup } from '../../../../shared/components/ui/dropdown/components/dropdown-group/dropdown-group';
import { DropdownItem } from '../../../../shared/components/ui/dropdown/components/dropdown-item/dropdown-item';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { RegisterProductStrategy } from './types';

@Component({
    selector: 'ecom-product-overview-actions',
    imports: [
        StatCard,
        Dropdown,
        DropdownTrigger,
        Button,
        FaIconComponent,
        DropdownContent,
        DropdownGroup,
        DropdownItem,
    ],
    templateUrl: './product-overview-actions.html',
    host: {
        class: 'flex items-center justify-between',
    },
})
export class ProductOverviewActions {
    faChevronDown = faChevronDown;
    totalCount = input.required<number>();

    creationRequest = output<RegisterProductStrategy>();

    onSingleProductCreationRequest(): void {
        this.creationRequest.emit('single');
    }

    onMultipleProductCreationRequest(): void {
        this.creationRequest.emit('multiple');
    }
}
