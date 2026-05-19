import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { SearchBar } from './search-bar';

describe('SearchBar', () => {
  let component: SearchBar;
  let fixture: ComponentFixture<SearchBar>;
  let host: HTMLElement;
  let input: HTMLInputElement;

  afterEach(() => {
    vi.useRealTimers();
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBar],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
    host = fixture.nativeElement as HTMLElement;
    input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the default search input state', () => {
    expect(input.type).toBe('search');
    expect(input.placeholder).toBe('Buscar...');
    expect(input.name).toBe('search');
    expect(input.id).toBe('search');
    expect(input.value).toBe('');
    expect(host.className).toContain('h-10');
    expect(host.className).toContain('bg-primary-background');
    expect(host.className).toContain('rounded-md');
    expect(host.className).toContain('text-base');
  });

  it('should update the host classes when the size changes', async () => {
    fixture.componentRef.setInput('size', 'xl');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.className).toContain('h-12');
    expect(host.className).toContain('text-xl');
    expect(host.className).not.toContain('h-10');
  });

  it('should merge custom classes into the host element', async () => {
    fixture.componentRef.setInput('class', 'rounded-xl');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.className).toContain('rounded-xl');
    expect(host.className).not.toContain('rounded-sm');
  });

  it('should update the public model immediately and debounce the output event', async () => {
    vi.useFakeTimers();
    const emitSpy = vi.spyOn(component.debounce, 'emit');

    input.value = 'lap';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('lap');
    expect(component.value()).toBe('lap');
    expect(emitSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(499);
    expect(emitSpy).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(1);
    expect(emitSpy).toHaveBeenCalledWith('lap');
  });

  it('should sync the input when the external value changes', () => {
    component.value.set('audifonos');
    fixture.detectChanges();

    expect(input.value).toBe('audifonos');
  });

  it('should respect a custom debounce time', () => {
    vi.useFakeTimers();
    const emitSpy = vi.spyOn(component.debounce, 'emit');

    fixture.componentRef.setInput('debounceTime', 0);
    fixture.detectChanges();

    input.value = 'mouse';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toBe('mouse');

    vi.runAllTimers();
    expect(emitSpy).toHaveBeenCalledWith('mouse');
  });

  it('should support disabling the native input', async () => {
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(input.disabled).toBe(true);
  });
});
