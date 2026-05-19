import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Spinner } from './spinner';

describe('Spinner', () => {
  let component: Spinner;
  let fixture: ComponentFixture<Spinner>;
  let nativeElement: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Spinner],
    }).compileComponents();

    fixture = TestBed.createComponent(Spinner);
    component = fixture.componentInstance;
    nativeElement = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the default spinner icon classes', () => {
    const icon = nativeElement.querySelector('fa-icon') as HTMLElement;

    expect(nativeElement.getAttribute('aria-label')).toBe('Cargando');
    expect(icon.className).toContain('animate-spin');
    expect(icon.className).toContain('size-4');
  });

  it('should apply the requested size scale', async () => {
    fixture.componentRef.setInput('size', 'lg');
    await fixture.whenStable();
    fixture.detectChanges();

    const icon = nativeElement.querySelector('fa-icon') as HTMLElement;

    expect(icon.className).toContain('size-6');
    expect(icon.className).not.toContain('size-4');
  });

  it('should merge custom classes on the host element', async () => {
    fixture.componentRef.setInput('class', 'text-primary');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(nativeElement.className).toContain('text-primary');
  });
});
