import { Component, computed, inject, signal } from '@angular/core';
import { PageLayout } from '../../../../shared/components/page-layout/page-layout';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { Card } from '../../../../shared/components/ui/card/card';
import { Button } from '../../../../shared/components/ui/button/button';
import { BrandForm } from '../../components/forms/brand-form/brand-form';
import { BrandsTable } from '../../components/brands-table/brands-table';
import { createPagination } from '../../../../shared/interfaces/pagination-options.interface';
import { FormActionsOptions, FormEvent } from '../../../../shared/interfaces/form.interface';
import { BrandDraft } from './types';
import { BrandFormData } from '../../components/forms/brand-form/types';
import { toDraftRecord } from '../../../../shared/mappers/entity-record.mapper';
import { BRAND_DRAFTS_COLUMNS } from './consts';
import { BrandService } from '../../services/brand/brand.service';
import { BulkSaveBrandItem } from '../../services/brand/types';

@Component({
    selector: 'ecom-bulk-brand-registration.page',
    imports: [PageLayout, PageHeader, Card, BrandForm, BrandsTable, Button],
    templateUrl: './bulk-brand-registration.page.html',
    styleUrl: './bulk-brand-registration.page.css',
    providers: [BrandService],
})
export class BulkBrandRegistrationPage {
    private readonly brandService: BrandService = inject(BrandService);

    brandDrafts = signal<BrandDraft[]>([]);
    readonly columns = computed(() => BRAND_DRAFTS_COLUMNS);
    readonly formActions = computed(
        () =>
            new FormActionsOptions({
                canClear: true,
                canCancel: false,
                clearOnSubmit: true,
                clearButtonVariant: 'ghost',
            }),
    );

    readonly hasChanges = computed(() => this.brandDrafts().length > 0);

    pagination = computed(() =>
        createPagination({
            showPagination: false,
        }),
    );

    onSubmit(event: FormEvent<BrandFormData>): void {
        const data = event.data;
        if (!data) {
            console.error('No se recibieron datos del formulario de marca.');
            throw new Error('No se recibieron datos del formulario de marca.');
        }
        const draft = toDraftRecord<BrandFormData>(data);
        this.brandDrafts.update((drafts) => [...drafts, draft]);
    }

    saveChanges(): void {
        const drafts = this.brandDrafts();
        if (drafts.length === 0) {
            console.warn('No hay cambios para guardar.');
            return;
        }
        const bulkSaveItems: BulkSaveBrandItem[] = drafts.map((draft) =>
            this.brandDraftToBulkSaveBrandItem(draft),
        );
        this.brandService.saveBrands(bulkSaveItems).subscribe({
            next: (response) => {
                console.log('Marcas guardadas exitosamente:', response);
                this.brandDrafts.set([]);
            },
            error: (error) => {
                console.error('Error al guardar las marcas:', error);
            },
        });
    }

    private brandDraftToBulkSaveBrandItem(draft: BrandDraft): BulkSaveBrandItem {
        return {
            key: draft.data._recordKey,
            name: draft.data.name,
            logoUrl: this.toBrandLogoUrl(draft.data.logoUrl),
            description: draft.data.description,
            metaTitle: draft.data.metaTitle,
            website: draft.data.website,
            metaDescription: draft.data.metaDescription,
            visibleInMenu: draft.data.visibleInMenu,
            isActive: draft.data.isActive,
        };
    }

    private toBrandLogoUrl(value: string[]): string {
        return value[0] ?? '';
    }
}
