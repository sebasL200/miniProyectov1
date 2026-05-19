import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { FormErrorMessage } from './form-error-message';

describe('FormErrorMessage', () => {
  let component: FormErrorMessage;
  let fixture: ComponentFixture<FormErrorMessage>;
  let control: FormControl<string>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormErrorMessage],
    }).compileComponents();

    fixture = TestBed.createComponent(FormErrorMessage);
    component = fixture.componentInstance;
    control = new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    });
    fixture.componentRef.setInput('control', control);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should hide the error message until the control is touched or dirty', () => {
    expect(fixture.nativeElement.textContent.trim()).toBe('');

    control.markAsTouched();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Este campo es obligatorio.');
  });

  it('should render a custom error message when one is provided', () => {
    fixture.componentRef.setInput('messages', {
      required: 'El nombre de la categoría es obligatorio.',
    });

    control.markAsTouched();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'El nombre de la categoría es obligatorio.',
    );
  });
});
