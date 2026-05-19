import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ToolbarButton } from './toolbar-button';

describe('ToolbarButton', () => {
  let component: ToolbarButton;
  let fixture: ComponentFixture<ToolbarButton>;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolbarButton],
    }).compileComponents();

    fixture = TestBed.createComponent(ToolbarButton);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'B');
    fixture.componentRef.setInput('title', 'Bold');
    await fixture.whenStable();
    fixture.detectChanges();
    button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply the default button classes', () => {
    expect(button.className).toContain('h-8');
    expect(button.className).toContain('text-sm');
    expect(button.className).toContain('text-muted-foreground');
  });

  it('should reflect the pressed state', async () => {
    fixture.componentRef.setInput('pressed', true);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(button.className).toContain('bg-accent');
    expect(button.getAttribute('aria-pressed')).toBe('true');
  });

  it('should emit when clicked', () => {
    const triggeredSpy = vi.fn();
    component.triggered.subscribe(triggeredSpy);

    button.click();

    expect(triggeredSpy).toHaveBeenCalledOnce();
  });

  it('should not emit when disabled', async () => {
    const triggeredSpy = vi.fn();
    component.triggered.subscribe(triggeredSpy);

    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    fixture.detectChanges();

    button.click();

    expect(triggeredSpy).not.toHaveBeenCalled();
  });
});
