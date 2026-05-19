import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { Toast } from './toast';

describe('Toast', () => {
  let component: Toast;
  let fixture: ComponentFixture<Toast>;

  afterEach(() => {
    fixture.destroy();
    vi.useRealTimers();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Toast],
    }).compileComponents();

    fixture = TestBed.createComponent(Toast);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('message', 'Toast de prueba');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply success styles by default', () => {
    const host = fixture.nativeElement as HTMLElement;

    expect(host.getAttribute('data-type')).toBe('success');
    expect(host.className).toContain('bg-success-background');
    expect(host.className).toContain('text-success');
  });

  it('should update host styles when type and status change', () => {
    fixture.componentRef.setInput('type', 'warning');
    component.status.set('closing');
    fixture.detectChanges();

    const host = fixture.nativeElement as HTMLElement;

    expect(host.getAttribute('data-type')).toBe('warning');
    expect(host.getAttribute('data-status')).toBe('closing');
    expect(host.className).toContain('bg-warning-background');
    expect(host.className).toContain('text-warning');
    expect(host.className).toContain('opacity-0');
    expect(host.className).toContain('-translate-y-2');
  });

  it('should close when the dismiss button is clicked', async () => {
    fixture.destroy();
    vi.useFakeTimers();

    fixture = TestBed.createComponent(Toast);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('message', 'Toast dismissible');
    fixture.detectChanges();

    const emitSpy = vi.spyOn(component.closed, 'emit');
    const closeButton = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    closeButton.click();
    fixture.detectChanges();

    expect(component.status()).toBe('closing');

    await vi.advanceTimersByTimeAsync(300);
    expect(component.status()).toBe('closed');
    expect(emitSpy).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(3000);
    expect(emitSpy).toHaveBeenCalledTimes(1);
  });
});
