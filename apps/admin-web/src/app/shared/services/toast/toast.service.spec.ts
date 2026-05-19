import { TestBed } from '@angular/core/testing';

import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should prepend newer toasts before older ones', () => {
    service.showSuccess('Toast inicial', 'Primero');
    service.showSuccess('Toast mas reciente', 'Segundo');

    const toasts = service.toasts();

    expect(toasts.length).toBe(2);
    expect(toasts[0].title).toBe('Segundo');
    expect(toasts[0].config.message).toBe('Toast mas reciente');
    expect(toasts[1].title).toBe('Primero');
    expect(toasts[1].config.message).toBe('Toast inicial');
  });

  it('should keep only the 4 newest toasts', () => {
    service.showSuccess('Toast 1', 'Primero');
    service.showSuccess('Toast 2', 'Segundo');
    service.showSuccess('Toast 3', 'Tercero');
    service.showSuccess('Toast 4', 'Cuarto');
    service.showSuccess('Toast 5', 'Quinto');

    const toasts = service.toasts();

    expect(toasts.length).toBe(4);
    expect(toasts.map((toast) => toast.title)).toEqual([
      'Quinto',
      'Cuarto',
      'Tercero',
      'Segundo',
    ]);
    expect(toasts.some((toast) => toast.title === 'Primero')).toBe(false);
  });
});
