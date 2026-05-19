import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Badge } from './badge';

describe('Badge', () => {
  let component: Badge;
  let fixture: ComponentFixture<Badge>;
  let nativeElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Badge],
    }).compileComponents();

    fixture = TestBed.createComponent(Badge);
    component = fixture.componentInstance;
    nativeElement = fixture.nativeElement as HTMLElement;
    nativeElement.textContent = 'Activo';
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply the default badge classes', () => {
    expect(nativeElement.className).toContain('bg-primary');
    expect(nativeElement.className).toContain('text-primary-foreground');
    expect(nativeElement.className).toContain('rounded-full');
    expect(nativeElement.className).toContain('px-2.5');
  });

  it('should update the variant classes', async () => {
    fixture.componentRef.setInput('variant', 'outline');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(nativeElement.className).toContain('border-border');
    expect(nativeElement.className).toContain('text-foreground');
    expect(nativeElement.className).toContain('bg-background');
  });

  it('should update the size classes', async () => {
    fixture.componentRef.setInput('size', 'lg');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(nativeElement.className).toContain('px-3');
    expect(nativeElement.className).toContain('py-1');
    expect(nativeElement.className).toContain('text-sm');
  });

  it('should merge custom classes', async () => {
    fixture.componentRef.setInput('class', 'uppercase');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(nativeElement.className).toContain('uppercase');
  });
});
