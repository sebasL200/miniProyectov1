import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CategoriesApiService, CategoryDto } from '../../services/categories-api.service';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div class="header-left">
          <h2 class="page-title">Categorías</h2>
          <span class="badge">{{ totalCount() }}</span>
        </div>
        <div class="header-right">
          <div class="search-box">
            <span class="search-icon">🔍</span>
            <input type="text" placeholder="Buscar categorías..." [ngModel]="searchQuery()" (ngModelChange)="onSearch($event)" class="search-input" />
          </div>
          <button class="btn btn-primary" (click)="openCreateDialog()">+ Nueva Categoría</button>
        </div>
      </div>

      @if (loading()) {
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Cargando categorías...</p>
        </div>
      } @else if (categories().length === 0) {
        <div class="empty-state">
          <span class="empty-icon">📂</span>
          <h3>No hay categorías</h3>
          <p>Crea tu primera categoría para comenzar.</p>
          <button class="btn btn-primary" (click)="openCreateDialog()">+ Crear Categoría</button>
        </div>
      } @else {
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Slug</th>
                <th>Padre</th>
                <th>Estado</th>
                <th>Menú</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (cat of categories(); track cat.id) {
                <tr>
                  <td class="name-cell">
                    <span class="name-text">{{ cat.name }}</span>
                  </td>
                  <td><code class="slug-badge">{{ cat.slug }}</code></td>
                  <td>{{ cat.parentName || '—' }}</td>
                  <td>
                    <span class="status-badge" [class.active]="cat.isActive" [class.inactive]="!cat.isActive">
                      {{ cat.isActive ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>
                    <span class="menu-badge" [class.visible]="cat.visibleInMenu">
                      {{ cat.visibleInMenu ? 'Sí' : 'No' }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <button class="btn-icon" title="Eliminar" (click)="deleteCategory(cat)">🗑️</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        @if (totalPages() > 1) {
          <div class="pagination">
            <button class="btn btn-sm" [disabled]="currentPage() <= 1" (click)="goToPage(currentPage() - 1)">← Anterior</button>
            <span class="page-info">Página {{ currentPage() }} de {{ totalPages() }}</span>
            <button class="btn btn-sm" [disabled]="currentPage() >= totalPages()" (click)="goToPage(currentPage() + 1)">Siguiente →</button>
          </div>
        }
      }

      @if (showCreateDialog()) {
        <div class="dialog-overlay" (click)="closeCreateDialog()">
          <div class="dialog" (click)="$event.stopPropagation()">
            <div class="dialog-header">
              <h3>Nueva Categoría</h3>
              <button class="btn-close" (click)="closeCreateDialog()">✕</button>
            </div>
            <div class="dialog-body">
              <label class="form-label">Nombre *</label>
              <input type="text" class="form-input" [(ngModel)]="newCatName" placeholder="Nombre de la categoría" />
              <label class="form-label">Descripción</label>
              <textarea class="form-input" [(ngModel)]="newCatDesc" placeholder="Descripción opcional" rows="3"></textarea>
              <div class="form-row">
                <label class="form-checkbox"><input type="checkbox" [(ngModel)]="newCatActive" /> Activa</label>
                <label class="form-checkbox"><input type="checkbox" [(ngModel)]="newCatMenu" /> Visible en menú</label>
              </div>
            </div>
            <div class="dialog-footer">
              <button class="btn btn-ghost" (click)="closeCreateDialog()">Cancelar</button>
              <button class="btn btn-primary" (click)="submitCreate()" [disabled]="!newCatName.trim()">Crear</button>
            </div>
          </div>
        </div>
      }

      @if (toast()) {
        <div class="toast" [class.success]="toastType() === 'success'" [class.error]="toastType() === 'error'">{{ toast() }}</div>
      }
    </div>
  `,
  styles: [`
    .page { max-width: 1200px; margin: 0 auto; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .page-title { font-size: 24px; font-weight: 700; margin: 0; color: #e1e4e8; }
    .badge { background: rgba(88, 166, 255, 0.15); color: #58a6ff; padding: 2px 10px; border-radius: 12px; font-size: 13px; font-weight: 600; }
    .header-right { display: flex; align-items: center; gap: 12px; }
    .search-box { display: flex; align-items: center; background: #21262d; border: 1px solid #30363d; border-radius: 8px; padding: 0 12px; }
    .search-icon { font-size: 14px; margin-right: 8px; }
    .search-input { background: transparent; border: none; color: #e1e4e8; padding: 8px 0; font-size: 14px; outline: none; width: 200px; }
    .search-input::placeholder { color: #484f58; }
    .btn { padding: 8px 16px; border-radius: 8px; border: 1px solid #30363d; background: #21262d; color: #e1e4e8; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
    .btn:hover { background: #30363d; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-primary { background: linear-gradient(135deg, #238636, #2ea043); border: 1px solid #238636; color: #fff; }
    .btn-primary:hover { background: linear-gradient(135deg, #2ea043, #3fb950); }
    .btn-sm { padding: 6px 12px; font-size: 13px; }
    .btn-ghost { background: transparent; border: 1px solid #30363d; }
    .btn-ghost:hover { background: #21262d; }
    .btn-icon { background: transparent; border: none; cursor: pointer; font-size: 16px; padding: 4px 8px; border-radius: 4px; transition: background 0.2s; }
    .btn-icon:hover { background: #30363d; }
    .btn-close { background: transparent; border: none; color: #8b949e; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px; }
    .btn-close:hover { background: #30363d; color: #e1e4e8; }
    .table-container { background: #161b22; border: 1px solid #21262d; border-radius: 12px; overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { text-align: left; padding: 12px 16px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #8b949e; background: #0d1117; border-bottom: 1px solid #21262d; }
    .data-table td { padding: 12px 16px; font-size: 14px; border-bottom: 1px solid #21262d; }
    .data-table tr:last-child td { border-bottom: none; }
    .data-table tr:hover td { background: rgba(88, 166, 255, 0.04); }
    .name-cell { font-weight: 500; }
    .slug-badge { background: #21262d; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #8b949e; }
    .status-badge { padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
    .status-badge.active { background: rgba(46, 160, 67, 0.15); color: #3fb950; }
    .status-badge.inactive { background: rgba(218, 54, 51, 0.15); color: #f85149; }
    .menu-badge { font-size: 13px; color: #8b949e; }
    .menu-badge.visible { color: #58a6ff; }
    .actions-cell { white-space: nowrap; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 16px; margin-top: 16px; padding: 12px; }
    .page-info { font-size: 13px; color: #8b949e; }
    .loading-state, .empty-state { text-align: center; padding: 64px 24px; color: #8b949e; }
    .spinner { width: 32px; height: 32px; border: 3px solid #21262d; border-top-color: #58a6ff; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-icon { font-size: 48px; display: block; margin-bottom: 16px; }
    .empty-state h3 { color: #e1e4e8; margin: 0 0 8px; }
    .empty-state p { margin: 0 0 24px; }
    .dialog-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .dialog { background: #161b22; border: 1px solid #30363d; border-radius: 12px; width: 480px; max-width: 90vw; box-shadow: 0 16px 48px rgba(0,0,0,0.4); }
    .dialog-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #21262d; }
    .dialog-header h3 { margin: 0; font-size: 16px; }
    .dialog-body { padding: 20px; }
    .dialog-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px; border-top: 1px solid #21262d; }
    .form-label { display: block; font-size: 13px; font-weight: 500; color: #8b949e; margin-bottom: 6px; margin-top: 12px; }
    .form-label:first-child { margin-top: 0; }
    .form-input { width: 100%; background: #0d1117; border: 1px solid #30363d; border-radius: 8px; color: #e1e4e8; padding: 8px 12px; font-size: 14px; outline: none; box-sizing: border-box; font-family: inherit; }
    .form-input:focus { border-color: #58a6ff; box-shadow: 0 0 0 3px rgba(88,166,255,0.15); }
    .form-row { display: flex; gap: 16px; margin-top: 12px; }
    .form-checkbox { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #8b949e; cursor: pointer; }
    .toast { position: fixed; bottom: 24px; right: 24px; padding: 12px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; z-index: 2000; animation: slideIn 0.3s ease; }
    .toast.success { background: rgba(46,160,67,0.9); color: #fff; }
    .toast.error { background: rgba(218,54,51,0.9); color: #fff; }
    @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
})
export class CategoriesPage implements OnInit {
  private api = inject(CategoriesApiService);

  categories = signal<CategoryDto[]>([]);
  loading = signal(true);
  totalCount = signal(0);
  totalPages = signal(0);
  currentPage = signal(1);
  searchQuery = signal('');
  showCreateDialog = signal(false);
  toast = signal('');
  toastType = signal<'success' | 'error'>('success');

  newCatName = '';
  newCatDesc = '';
  newCatActive = true;
  newCatMenu = false;

  ngOnInit() { this.loadCategories(); }

  loadCategories() {
    this.loading.set(true);
    this.api.listCategories({ page: this.currentPage(), pageSize: 15, query: this.searchQuery() || undefined }).subscribe({
      next: (result) => {
        this.categories.set((result.categories || []).filter((c: any): c is CategoryDto => c !== null));
        this.totalCount.set(result.totalCount || 0);
        this.totalPages.set(result.totalPages || 0);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.showToast('Error al cargar categorías', 'error'); },
    });
  }

  onSearch(query: string) {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.loadCategories();
  }

  goToPage(page: number) { this.currentPage.set(page); this.loadCategories(); }

  openCreateDialog() { this.showCreateDialog.set(true); this.newCatName = ''; this.newCatDesc = ''; this.newCatActive = true; this.newCatMenu = false; }

  closeCreateDialog() { this.showCreateDialog.set(false); }

  submitCreate() {
    this.api.createCategory({ name: this.newCatName.trim(), description: this.newCatDesc.trim() || undefined, isActive: this.newCatActive, visibleInMenu: this.newCatMenu }).subscribe({
      next: () => { this.closeCreateDialog(); this.showToast('Categoría creada exitosamente', 'success'); this.loadCategories(); },
      error: () => this.showToast('Error al crear categoría', 'error'),
    });
  }

  deleteCategory(cat: CategoryDto) {
    if (!window.confirm(`¿Eliminar "${cat.name}"?`)) return;
    this.api.deleteCategory(cat.id).subscribe({
      next: () => { this.showToast('Categoría eliminada', 'success'); this.loadCategories(); },
      error: () => this.showToast('Error al eliminar categoría', 'error'),
    });
  }

  private showToast(msg: string, type: 'success' | 'error') {
    this.toast.set(msg); this.toastType.set(type);
    window.setTimeout(() => this.toast.set(''), 3000);
  }
}
