import { Component, inject, OnInit, signal } from '@angular/core';
import { CategoriesApiService, CategoryDto } from '../../services/categories-api.service';
import { PageLayout, PageHeader, DataGrid, Button, Switch, CellTemplate } from '@shared/components';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPlus, faPenToSquare, faEye, faTrash, faEllipsisVertical, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { DataGridColumn } from '@shared/components/ui/data-grid/data-grid.types';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [
    PageLayout, PageHeader, DataGrid, Button, Switch, CellTemplate, FaIconComponent
  ],
  template: `
    <ecom-page-layout [loading]="loading()">
      <header ecom-page-header title="Categorías" description="Administración de categorías presentes en el sitio">
        <div slot="actions" class="flex gap-2 ml-auto">
          <ecom-button variant="primary" (click)="openCreateDialog()">
            Nuevo registro
          </ecom-button>
        </div>
      </header>

      <main class="mt-4">
        <ecom-data-grid [columns]="columns" [data]="categories()">
          <!-- Switch Visibilidad Menú -->
          <ng-template ecom-cell-template template="showMenu" let-row>
            <ecom-switch [checked]="row.visibleInMenu" (checkedChange)="toggleMenuVisibility(row, $event)"></ecom-switch>
          </ng-template>

          <!-- Switch Estado Activo -->
          <ng-template ecom-cell-template template="status" let-row>
            <ecom-switch [checked]="row.isActive" (checkedChange)="toggleStatus(row, $event)"></ecom-switch>
          </ng-template>

          <!-- Acciones -->
          <ng-template ecom-cell-template template="actions" let-row>
            <div class="flex gap-2 justify-center">
              <ecom-button variant="ghost" size="icon-sm" title="Editar">
                <fa-icon [icon]="faPenToSquare" class="text-gray-500 hover:text-primary"></fa-icon>
              </ecom-button>
              <ecom-button variant="ghost" size="icon-sm" title="Ver detalles">
                <fa-icon [icon]="faEye" class="text-gray-500 hover:text-primary"></fa-icon>
              </ecom-button>
              <ecom-button variant="ghost" size="icon-sm" title="Eliminar" (click)="deleteCategory(row)">
                <fa-icon [icon]="faTrash" class="text-red-500 hover:text-red-700"></fa-icon>
              </ecom-button>
            </div>
          </ng-template>
        </ecom-data-grid>
      </main>
    </ecom-page-layout>
  `
})
export class CategoriesPage implements OnInit {
  private api = inject(CategoriesApiService);

  faPlus = faPlus;
  faPenToSquare = faPenToSquare;
  faEye = faEye;
  faTrash = faTrash;
  faChevronDown = faChevronDown;
  faEllipsisVertical = faEllipsisVertical;

  columns: DataGridColumn[] = [
    { field: 'name', label: 'Nombre' },
    { field: 'slug', label: 'Slug' },
    { field: 'parentName', label: 'Categoría padre' },
    { field: 'metaTitle', label: 'Meta title' },
    { field: 'visibleInMenu', label: 'Visibilidad en el menú', template: 'showMenu' },
    { field: 'isActive', label: 'Estado', template: 'status' },
    { label: 'Acciones', template: 'actions' }
  ];

  categories = signal<CategoryDto[]>([]);
  loading = signal(true);
  currentPage = signal(1);

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading.set(true);
    this.api.listCategories({ page: this.currentPage(), pageSize: 15 }).subscribe({
      next: (result) => {
        this.categories.set((result.categories || []).filter((c: any): c is CategoryDto => c !== null));
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  toggleStatus(category: CategoryDto, isActive: boolean) {
    category.isActive = isActive;
    // Call API patch...
  }

  toggleMenuVisibility(category: CategoryDto, visibleInMenu: boolean) {
    category.visibleInMenu = visibleInMenu;
    // Call API patch...
  }

  deleteCategory(cat: CategoryDto) {
    if (!window.confirm(`¿Eliminar "${cat.name}"?`)) return;
    this.api.deleteCategory(cat.id).subscribe(() => this.loadCategories());
  }

  openCreateDialog() {
    // Integration to the dialog service to register single category
  }
}
