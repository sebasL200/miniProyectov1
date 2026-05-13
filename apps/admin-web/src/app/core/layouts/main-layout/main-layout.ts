import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-header">
          <h1 class="logo">📦 Catálogo</h1>
        </div>
        <nav class="sidebar-nav">
          <a routerLink="/categories" class="nav-item active">
            <span class="nav-icon">📂</span>
            <span class="nav-label">Categorías</span>
          </a>
        </nav>
      </aside>
      <main class="main-content">
        <header class="top-bar">
          <div class="top-bar-title">Panel de Administración</div>
          <div class="top-bar-user">👤 Admin (Test)</div>
        </header>
        <div class="page-content">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; height: 100vh; background: #0f1117; color: #e1e4e8; font-family: 'Inter', 'Segoe UI', system-ui, sans-serif; }
    .sidebar { width: 260px; background: #161b22; border-right: 1px solid #21262d; display: flex; flex-direction: column; }
    .sidebar-header { padding: 24px 20px; border-bottom: 1px solid #21262d; }
    .logo { font-size: 20px; font-weight: 700; margin: 0; background: linear-gradient(135deg, #58a6ff, #bc8cff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .sidebar-nav { padding: 12px 8px; flex: 1; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 8px; color: #8b949e; text-decoration: none; transition: all 0.2s; margin-bottom: 4px; }
    .nav-item:hover { background: #1c2128; color: #e1e4e8; }
    .nav-item.active { background: rgba(88, 166, 255, 0.1); color: #58a6ff; }
    .nav-icon { font-size: 18px; }
    .nav-label { font-size: 14px; font-weight: 500; }
    .main-content { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
    .top-bar { height: 56px; background: #161b22; border-bottom: 1px solid #21262d; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; }
    .top-bar-title { font-size: 14px; font-weight: 600; color: #e1e4e8; }
    .top-bar-user { font-size: 13px; color: #8b949e; }
    .page-content { flex: 1; overflow-y: auto; padding: 24px; }
  `],
})
export class MainLayout {}
