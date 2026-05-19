import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Button } from './button';

describe('Button', () => {
  let component: Button;
  let fixture: ComponentFixture<Button>;
  let nativeElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Button);
    component = fixture.componentInstance;
    nativeElement = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  function getRenderedElement(): HTMLButtonElement | HTMLAnchorElement {
    return (
      nativeElement.querySelector('button') ?? nativeElement.querySelector('a')
    ) as HTMLButtonElement | HTMLAnchorElement;
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply the default primary variant classes', () => {
    const button = getRenderedElement();

    expect(button.className).toContain('bg-primary');
    expect(button.className).toContain('text-primary-foreground');
    expect(button.className).toContain('h-10');
    expect(button.className).toContain('text-base');
  });

  it('should update the host classes when the variant changes', async () => {
    fixture.componentRef.setInput('variant', 'danger');
    await fixture.whenStable();
    fixture.detectChanges();

    const button = getRenderedElement();

    expect(button.className).toContain('bg-destructive');
    expect(button.className).toContain('text-destructive-foreground');
    expect(button.className).not.toContain('bg-secondary-background');
  });

  it('should apply outline variant classes', async () => {
    fixture.componentRef.setInput('variant', 'outline');
    await fixture.whenStable();
    fixture.detectChanges();

    const button = getRenderedElement();

    expect(button.className).toContain('bg-background');
    expect(button.className).toContain('border-border');
    expect(button.className).toContain('text-foreground');
  });

  it('should render an anchor for the link variant', async () => {
    fixture.componentRef.setInput('variant', 'link');
    fixture.componentRef.setInput('routerLink', '/catalogs');
    await fixture.whenStable();
    fixture.detectChanges();

    const link = getRenderedElement();

    expect(link.tagName).toBe('A');
    expect(link.className).toContain('text-primary');
    expect(link.className).toContain('underline-offset-4');
    expect(link.className).toContain('hover:underline');
    expect(link.className).toContain('shadow-none');
  });

  it('should merge custom classes and size classes', async () => {
    fixture.componentRef.setInput('size', 'xl');
    fixture.componentRef.setInput('class', 'w-full');
    await fixture.whenStable();
    fixture.detectChanges();

    const button = getRenderedElement();

    expect(button.className).toContain('h-12');
    expect(button.className).toContain('text-xl');
    expect(button.className).toContain('w-full');
  });

  it('should forward the native button type', async () => {
    fixture.componentRef.setInput('type', 'submit');
    await fixture.whenStable();
    fixture.detectChanges();

    const button = getRenderedElement() as HTMLButtonElement;

    expect(button.type).toBe('submit');
  });
});
