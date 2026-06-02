import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { PageLayout } from '../../../../shared/components/page-layout/page-layout';
import { BrandOverviewActions } from '../../components/brand-overview-actions/brand-overview-actions';
import { BrandsTable } from '../../components/brands-table/brands-table';
import { BrandsPageService } from './brands.page.service';
import { Brand } from '../../../../shared/models/brand.model';
import { toPersistedRecord } from '../../../../shared/mappers/entity-record.mapper';
import { BrandsTableService } from '../../components/brands-table/brands-table.service';
import { BrandActionsService } from '../../services/brand-actions/brand-actions.service';
import { ToastService } from '../../../../shared/services/toast/toast.service';
import { RegisterBrandStrategy } from '../../components/brand-overview-actions/types';
import { DialogService } from '../../../../shared/services/dialog/dialog.service';
import { RegisterBrandDialog } from '../../dialogs/register-brand/register-brand.dialog';
import { DIMENSIONS } from '../../../../shared/constants/dimensions.consts';
import { Router } from '@angular/router';
import { createPagination } from '../../../../shared/interfaces/pagination-options.interface';
import { BrandRecord } from '../../components/brands-table/types';
import { filter, Observable } from 'rxjs';
import { BrandDetailsDialog } from '../../dialogs/brand-details/brand-details.dialog';

@Component({
    selector: 'ecom-brands-page',
    imports: [PageLayout, PageHeader, BrandOverviewActions, BrandsTable],
    templateUrl: './brands.page.html',
    styleUrl: './brands.page.css',
    providers: [BrandsPageService, BrandsTableService, BrandActionsService],
})
export class BrandsPage implements OnInit {
    private readonly service = inject(BrandsPageService);
    private readonly dialogService = inject(DialogService);
    private readonly tableService = inject(BrandsTableService);
    private readonly brandActionsService = inject(BrandActionsService);
    private readonly toast = inject(ToastService);
    private readonly router: Router = inject(Router);

    totalBrands = signal<number>(0);
    private readonly totalPages = signal<number>(0);
    private readonly currentPage = computed(() => this.service.paginationParams().page);
    readonly pageSize = 5;
    readonly pagination = computed(() =>
        createPagination({
            showPagination: true,
            page: this.currentPage(),
            size: this.pageSize,
            total: this.totalBrands(),
            pages: this.totalPages(),
        }),
    );
    readonly brands = signal<Brand[]>([]);
    readonly rows = computed(() => this.brands().map(toPersistedRecord));

    ngOnInit(): void {
        this.loadCompositePage();
    }

    // ─── Page Initialization ────────────────────────────────────────────────

    private loadCompositePage(): void {
        this.service.getCompositeBrandsPage().subscribe({
            next: (response) => this.handleCompositePageResponse(response),
        });
    }

    private handleCompositePageResponse(response: any): void {
        if (response.success) {
            this.brands.set(response.data.brands);
            this.totalBrands.set(response.data.totalCount);
            this.totalPages.set(response.data.totalPages);
        }
        this.registerTableEventHandlers();
    }

    // ─── Brand Creation Handler ─────────────────────────────────────────────

    onBrandCreationRequest(strategy: RegisterBrandStrategy): void {
        switch (strategy) {
            case 'single':
                this.handleSingleBrandCreation();
                break;
            case 'multiple':
                this.handleMultiplpeBrandCreation();
                break;
            default:
                this.toast.showError('Estrategia de creación no reconocida');
        }
    }

    private handleSingleBrandCreation(): void {
        this.openRegisterBrandDialog().subscribe({
            next: (newBrand) => {
                if (newBrand) {
                    this.fetchBrands();
                    this.toast.showSuccess(`Marca ${newBrand.name} creada correctamente`);
                }
            },
        });
    }

    private openRegisterBrandDialog(): Observable<Brand | undefined> {
        return this.dialogService.open(RegisterBrandDialog, undefined, {
            title: 'Nuevo Registro',
            width: DIMENSIONS.MODAL.WIDTH,
            height: DIMENSIONS.MODAL.HEIGHT,
        }).onClose$;
    }

    private handleMultiplpeBrandCreation(): void {
        this.router.navigate(['catalogos/marcas/bulk-registration']);
    }

    // ─── Table Event Handlers Registration ──────────────────────────────────

    private registerTableEventHandlers(): void {
        this.registerPageChangeHandler();
        this.registerStatusChangeHandler();
        this.registerVisibleInMenuChangeHandler();
        this.registerEditBrandHandler();
        this.registerViewBrandDetailsHandler();
        this.registerDeleteBrandHandler();
    }

    // ─── Actions ────────────────────────────────────────────────────────

    private registerViewBrandDetailsHandler(): void {
        this.tableService.viewBrand$.subscribe({
            next: (record: BrandRecord) => this.viewBrandDetails(record),
        });
    }

    private viewBrandDetails(record: BrandRecord): void {
        this.dialogService.open(BrandDetailsDialog, record.data._recordKey, {
            title: 'Detalles de la Marca',
            width: DIMENSIONS.MODAL.WIDTH,
            height: DIMENSIONS.MODAL.HEIGHT,
        });
    }

    private registerEditBrandHandler(): void {
        this.tableService.editBrand$.subscribe({
            next: (record: BrandRecord) => this.editBrand(record),
        });
    }

    private editBrand(record: BrandRecord): void {
        this.router.navigate(['catalogos/marcas/edit', record.data._recordKey]);
    }

    private registerDeleteBrandHandler(): void {
        this.tableService.deleteBrand$.subscribe({
            next: (record: BrandRecord) => {
                this.deleteBrand(record);
            },
        });
    }

    private deleteBrand(record: BrandRecord): void {
        const brand = this.findBrandById(record.data._recordKey);
        if (!brand) {
            this.toast.showError('No se encontró la marca para eliminar');
            return;
        }

        this.confirmBrandDeletion(brand)
            .pipe(filter(Boolean))
            .subscribe(() => this.executeBrandDeletion(record.data._recordKey, brand));
    }

    private confirmBrandDeletion(brand: Brand): Observable<boolean | undefined> {
        return this.dialogService.openConfirm({
            message: `¿Estás seguro de que deseas eliminar la marca ${brand.name}?`,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            confirmVariant: 'danger',
        }).onClose$;
    }

    private executeBrandDeletion(brandId: string, brand: Brand): void {
        this.brandActionsService.deleteBrand(brandId).subscribe({
            next: () => this.onBrandDeletionSuccess(brandId, brand),
            error: () => this.onBrandDeletionError(brand),
        });
    }

    private onBrandDeletionSuccess(brandId: string, brand: Brand): void {
        this.brands.update((brands) => brands.filter((b) => b.id !== brandId));
        this.toast.showSuccess(`Marca ${brand.name} eliminada correctamente`);
        this.fetchBrands();
    }

    private onBrandDeletionError(brand: Brand): void {
        this.toast.showError(`Error al eliminar la marca: ${brand.name}`);
    }

    // ─── Table Page ────────────────────────────────────────────────────────

    private registerPageChangeHandler(): void {
        this.tableService.pageChange$.subscribe({
            next: (newPage) => this.handlePageChange(newPage),
        });
    }

    private handlePageChange(newPage: number): void {
        this.service.updatePage(newPage);
        this.fetchBrands();
    }

    // ─── Brand Status ────────────────────────────────────────────────────────

    private registerStatusChangeHandler(): void {
        this.tableService.brandStatusChange$.subscribe({
            next: ({ snapshot, newValue }) => this.handleStatusChange(snapshot, newValue),
        });
    }

    private handleStatusChange(snapshot: any, newValue: boolean): void {
        const brand = this.findBrandById(snapshot.data._recordKey);

        this.brandActionsService
            .toggleBrandActiveStatus({ id: snapshot.data._recordKey, isActive: newValue })
            .subscribe({
                next: () => this.onStatusChangeSuccess(brand),
                error: () => this.onStatusChangeError(snapshot.data._recordKey, newValue, brand),
            });
    }

    private onStatusChangeSuccess(brand: Brand | undefined): void {
        this.toast.showSuccess(`Estado de la marca ${brand?.name} actualizado correctamente`);
    }

    private onStatusChangeError(id: string, newValue: boolean, brand: Brand | undefined): void {
        this.revertBrandStatus(id, newValue);
        this.toast.showError(`Error al actualizar el estado: ${brand?.name}`);
    }

    private revertBrandStatus(id: string, failedValue: boolean): void {
        this.brands.update((brands) =>
            brands.map((b) => (b.id === id ? { ...b, isActive: !failedValue } : b)),
        );
    }

    // ─── Brand Visibility in Menu ────────────────────────────────────────────

    private registerVisibleInMenuChangeHandler(): void {
        this.tableService.brandVisibleInMenuChange$.subscribe({
            next: ({ snapshot, newValue }) => this.handleVisibilityChange(snapshot, newValue),
        });
    }

    private handleVisibilityChange(snapshot: any, newValue: boolean): void {
        const brand = this.findBrandById(snapshot.data._recordKey);

        this.brandActionsService
            .toggleBrandVisibilityInMenu({ id: snapshot.data._recordKey, visibleInMenu: newValue })
            .subscribe({
                next: () => this.onVisibilityChangeSuccess(brand),
                error: () =>
                    this.onVisibilityChangeError(snapshot.data._recordKey, newValue, brand),
            });
    }

    private onVisibilityChangeSuccess(brand: Brand | undefined): void {
        this.toast.showSuccess(
            `Visibilidad en menú de la marca ${brand?.name} actualizada correctamente`,
        );
    }

    private onVisibilityChangeError(id: string, newValue: boolean, brand: Brand | undefined): void {
        this.revertBrandVisibility(id, newValue);
        this.toast.showError(`Error al actualizar la visibilidad en menú: ${brand?.name}`);
    }

    private revertBrandVisibility(id: string, failedValue: boolean): void {
        this.brands.update((brands) =>
            brands.map((b) => (b.id === id ? { ...b, visibleInMenu: !failedValue } : b)),
        );
    }

    // ─── Shared Utilities ────────────────────────────────────────────────────

    private findBrandById(id: string): Brand | undefined {
        return this.brands().find((b) => b.id === id);
    }

    private fetchBrands(): void {
        this.service.fetchBrands().subscribe({
            next: (response) => {
                if (response.success) {
                    this.brands.set(response.data.brands);
                    this.totalBrands.set(response.data.totalCount);
                    this.totalPages.set(response.data.totalPages);
                }
            },
        });
    }
}
