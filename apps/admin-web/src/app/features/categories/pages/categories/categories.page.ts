import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CategoriesApiService, CategoryDto } from '../../services/categories-api.service';
import { PageLayout, PageHeader, Card, StatCard, Button, Switch, CellTemplate, PaginationFooter, DataGrid } from '@shared/components';
import { Dropdown } from '@shared/components/ui/dropdown/dropdown';
import { DropdownTrigger } from '@shared/components/ui/dropdown/components/dropdown-trigger/dropdown-trigger';
import { DropdownContent } from '@shared/components/ui/dropdown/components/dropdown-content/dropdown-content';
import { DropdownGroup } from '@shared/components/ui/dropdown/components/dropdown-group/dropdown-group';
import { DropdownItem } from '@shared/components/ui/dropdown/components/dropdown-item/dropdown-item';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faChevronDown, faPenNib, faEye, faSquarePlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { DataGridColumn } from '@shared/components/ui/data-grid/data-grid.types';
import { createPagination } from '@shared/interfaces';
import { ToastService } from '@shared/services/toast/toast.service';
import { DialogService } from '@shared/services/dialog/dialog.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [
    PageLayout,
    PageHeader,
    Card,
    StatCard,
    DataGrid,
    Button,
    Switch,
    CellTemplate,
    PaginationFooter,
    Dropdown,
    DropdownTrigger,
    DropdownContent,
    DropdownGroup,
    DropdownItem,
    FaIconComponent
  ],
  template: `
    <ecom-page-layout [loading]="loading()">
      <header ecom-page-header title="Categorías" description="Administración de categorías presentes en el sitio"></header>

      <article class="mb-5 flex items-center justify-between">
        <ecom-stat-card [value]="totalCategories()" />
        
        <ecom-dropdown>
          <ecom-dropdown-trigger>
            <ecom-button class="flex items-center gap-2 flex-row-reverse" variant="primary">
              <span>Nuevo Registro</span>
              <fa-icon [icon]="faChevronDown" />
            </ecom-button>
          </ecom-dropdown-trigger>
          <ecom-dropdown-content class="w-48 bg-white border border-gray-200 shadow-lg rounded-md py-1">
            <ecom-dropdown-group>
              <ecom-dropdown-item label="Registro único" (click)="onCategoryCreationRequest('single')" />
              <ecom-dropdown-item label="Registro múltiple" (click)="onCategoryCreationRequest('multiple')" />
            </ecom-dropdown-group>
          </ecom-dropdown-content>
        </ecom-dropdown>
      </article>

      <main>
        <ecom-card>
          <ecom-data-grid [columns]="columns" [data]="categories()">
            <!-- Switch Visibilidad Menú -->
            <ng-template ecom-cell-template template="showMenu" let-row>
              <ecom-switch variant="secondary" [checked]="row.visibleInMenu" (checkedChange)="toggleMenuVisibility(row, $event)"></ecom-switch>
            </ng-template>

            <!-- Switch Estado Activo -->
            <ng-template ecom-cell-template template="status" let-row>
              <ecom-switch variant="secondary" [checked]="row.isActive" (checkedChange)="toggleStatus(row, $event)"></ecom-switch>
            </ng-template>

            <!-- Acciones -->
            <ng-template ecom-cell-template template="actions" let-row>
              <div class="flex gap-2 justify-center">
                <ecom-button class="text-gray-700/80 hover:text-primary" title="Editar" variant="outline" size="icon-sm" (clicked)="onEdit(row)">
                  <fa-icon [icon]="faPenNib" />
                </ecom-button>
                <ecom-button class="text-gray-700/80 hover:text-primary" title="Detalles" variant="outline" size="icon-sm" (clicked)="onView(row)">
                  <fa-icon [icon]="faEye" />
                </ecom-button>
                <ecom-button class="text-gray-700/80 hover:text-primary" title="Subcategorías" variant="outline" size="icon-sm" (clicked)="onViewSubcategories(row)">
                  <fa-icon [icon]="faSquarePlus" />
                </ecom-button>
                <ecom-button class="text-gray-700/80 hover:text-red-500" title="Eliminar" variant="outline" size="icon-sm" (clicked)="deleteCategory(row)">
                  <fa-icon [icon]="faTrashCan" />
                </ecom-button>
              </div>
            </ng-template>
          </ecom-data-grid>

          @if (pagination().showPagination) {
            <ecom-pagination-footer class="mt-5" [currentPage]="pagination().page" [pages]="pagination().pages" (pageChange)="onPageChange($event)" />
          }
        </ecom-card>
      </main>
    </ecom-page-layout>
  `
})
export class CategoriesPage implements OnInit {
  private readonly api = inject(CategoriesApiService);
  private readonly toastService = inject(ToastService);
  private readonly dialogService = inject(DialogService);
  private readonly router = inject(Router);

  faChevronDown = faChevronDown;
  faPenNib = faPenNib;
  faEye = faEye;
  faSquarePlus = faSquarePlus;
  faTrashCan = faTrashCan;

  columns: DataGridColumn[] = [
    { field: 'name', label: 'Nombre' },
    { field: 'slug', label: 'Slug' },
    { field: 'parentName', label: 'Categoría Padre' },
    { field: 'visibleInMenu', label: 'Visibilidad en el Menú', template: 'showMenu' },
    { field: 'isActive', label: 'Estado', template: 'status' },
    { label: 'Acciones', template: 'actions' }
  ];

  categories = signal<CategoryDto[]>([]);
  loading = signal(true);

  readonly pageSize = 5;
  totalCategories = signal<number>(0);
  totalPages = signal<number>(0);
  currentPage = signal<number>(1);

  readonly pagination = computed(() =>
    createPagination({
      showPagination: true,
      page: this.currentPage(),
      size: this.pageSize,
      total: this.totalCategories(),
      pages: this.totalPages(),
    }),
  );

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.api.listCategories({ page: this.currentPage(), pageSize: this.pageSize }).subscribe({
      next: (result) => {
        this.categories.set((result.categories || []).filter((c: any): c is CategoryDto => c !== null));
        this.totalCategories.set(result.totalCount || 0);
        this.totalPages.set(result.totalPages || 0);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.showError('Error al cargar las categorías. Por favor, inténtalo de nuevo.');
      }
    });
  }

  toggleStatus(category: CategoryDto, isActive: boolean) {
    const originalValue = category.isActive;
    category.isActive = isActive;
    
    this.api.updateCategory(category.id, { isActive }).subscribe({
      next: () => {
        this.toastService.showSuccess(`Estado de la categoría "${category.name}" actualizado correctamente.`);
      },
      error: () => {
        category.isActive = originalValue;
        this.toastService.showError(`Error al actualizar el estado de la categoría "${category.name}".`);
      }
    });
  }

  toggleMenuVisibility(category: CategoryDto, visibleInMenu: boolean) {
    const originalValue = category.visibleInMenu;
    category.visibleInMenu = visibleInMenu;
    
    this.api.updateCategory(category.id, { visibleInMenu }).subscribe({
      next: () => {
        this.toastService.showSuccess(`Visibilidad en menú de la categoría "${category.name}" actualizada correctamente.`);
      },
      error: () => {
        category.visibleInMenu = originalValue;
        this.toastService.showError(`Error al actualizar la visibilidad en menú de la categoría "${category.name}".`);
      }
    });
  }

  deleteCategory(cat: CategoryDto) {
    this.dialogService
      .openConfirm({
        message: '¿Estás seguro de que deseas eliminar esta categoría?',
        confirmText: 'Eliminar',
        confirmVariant: 'danger',
      })
      .onClose$.subscribe((confirmed) => {
        if (confirmed) {
          this.api.deleteCategory(cat.id).subscribe({
            next: () => {
              this.loadCategories();
              this.toastService.showSuccess('Categoría eliminada correctamente.');
            },
            error: () => {
              this.toastService.showError('Error al eliminar la categoría.');
            }
          });
        }
      });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.loadCategories();
  }

  onCategoryCreationRequest(strategy: 'single' | 'multiple') {
    if (strategy === 'single') {
      this.toastService.showSuccess('Registro único (Próximamente)');
    } else {
      this.toastService.showSuccess('Registro múltiple (Próximamente)');
    }
  }

  onEdit(row: CategoryDto) {
    this.router.navigate([`catalogos/categorias/${row.id}/edit`]);
  }

  onView(row: CategoryDto) {
    this.toastService.showSuccess(`Ver detalles de: ${row.name} (Próximamente)`);
  }

  onViewSubcategories(row: CategoryDto) {
    this.router.navigate([`catalogos/categorias/${row.id}/subcategories`]);
  }
}
