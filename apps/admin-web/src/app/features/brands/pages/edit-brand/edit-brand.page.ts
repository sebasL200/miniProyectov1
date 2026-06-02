import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { BrandActionsService } from '../../services/brand-actions/brand-actions.service';
import { BrandService } from '../../services/brand/brand.service';
import { Brand } from '../../../../shared/models/brand.model';
import { PageLayout } from '../../../../shared/components/page-layout/page-layout';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Card } from '../../../../shared/components/ui/card/card';
import { BrandForm } from '../../components/forms/brand-form/brand-form';
import { BrandFormData } from '../../components/forms/brand-form/types';
import { FormEvent } from '../../../../shared/interfaces/form.interface';
import { UpdateBrand } from '../../services/brand-actions/types';

@Component({
    selector: 'ecom-edit-brand.page',
    imports: [PageLayout, PageHeader, BrandForm, Card],
    templateUrl: './edit-brand.page.html',
    styleUrl: './edit-brand.page.css',
    providers: [BrandActionsService, BrandService],
})
export class EditBrandPage implements OnInit {
    private readonly brandActionsService: BrandActionsService = inject(BrandActionsService);
    private readonly brandService: BrandService = inject(BrandService);

    id = input.required<string>();
    brand = signal<Brand | null>(null);
    brandFormData = computed(() => this.toBrandFormData(this.brand()));

    ngOnInit() {
        this.loadBrand();
    }

    onSaveChanges(event: FormEvent<BrandFormData>) {
        if (!this.brand() || !event.hasChanges) return;

        const payload = this.brandFormDataToUpdateBrand(event.changes!);

        this.brandActionsService.updateBrand(this.id(), payload).subscribe({
            next: (response) => {
                this.brand.set(response.data);
            },
            error: (error) => console.error('Error updating brand:', error),
        });
    }

    private brandFormDataToUpdateBrand(changes: Partial<BrandFormData>): UpdateBrand {
        return {
            ...(changes.name !== undefined && { name: changes.name }),
            ...(changes.description !== undefined && { description: changes.description }),
            ...(changes.logoUrl !== undefined && { logoUrl: this.toBrandLogoUrl(changes.logoUrl) }),
            ...(changes.isActive !== undefined && { isActive: changes.isActive }),
            ...(changes.metaDescription !== undefined && {
                metaDescription: changes.metaDescription,
            }),
            ...(changes.metaTitle !== undefined && { metaTitle: changes.metaTitle }),
            ...(changes.website !== undefined && { website: changes.website }),
            ...(changes.visibleInMenu !== undefined && { visibleInMenu: changes.visibleInMenu }),
        };
    }

    private loadBrand() {
        this.brandService.getBrandById(this.id()).subscribe({
            next: (response) => {
                this.brand.set(response.data);
            },
        });
    }

    private toBrandFormData(brand: Brand | null): BrandFormData | undefined {
        if (!brand) {
            return undefined;
        }

        return {
            name: brand.name,
            description: brand.description,
            logoUrl: this.toBrandLogoUploadValue(brand.logoUrl),
            isActive: brand.isActive,
            metaDescription: brand.metaDescription,
            metaTitle: brand.metaTitle,
            website: brand.website,
            visibleInMenu: brand.visibleInMenu,
        };
    }

    private toBrandLogoUrl(value: string[]): string {
        return value[0] ?? '';
    }

    private toBrandLogoUploadValue(value?: string | null): string[] {
        return value ? [value] : [];
    }
}
