import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { InputDate } from './input-date';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, InputDate],
  template: `
    <form [formGroup]="form">
      <ecom-input-date formControlName="value" />
    </form>
  `,
})
class InputDateReactiveHost {
  readonly form = new FormGroup({
    value: new FormControl<Date | null>(new Date(2026, 3, 13)),
  });
}

describe('InputDate', () => {
  let component: InputDate;
  let fixture: ComponentFixture<InputDate>;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputDate, InputDateReactiveHost],
    }).compileComponents();

    fixture = TestBed.createComponent(InputDate);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
    input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply the default input classes', () => {
    expect(input.className).toContain('h-10');
    expect(input.className).toContain('w-full');
    expect(input.className).toContain('border-border');
    expect(input.className).toContain('bg-background');
    expect(input.className).toContain('text-base');
  });

  it('should update the input classes when the size changes', async () => {
    fixture.componentRef.setInput('size', 'xl');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(input.className).toContain('h-12');
    expect(input.className).toContain('text-xl');
    expect(input.className).not.toContain('h-10');
  });

  it('should merge custom classes into the input element', async () => {
    fixture.componentRef.setInput('class', 'rounded-xl');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(input.className).toContain('rounded-xl');
    expect(input.className).not.toContain('rounded-sm');
  });

  it('should render a date input', () => {
    expect(input.type).toBe('date');
  });

  it('should update the model value on input events', () => {
    input.value = '2026-04-14';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toEqual(new Date(2026, 3, 14));
  });

  it('should clear the model value when the input is emptied', () => {
    input.value = '';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toBeNull();
  });

  it('should work with formControlName', async () => {
    const hostFixture = TestBed.createComponent(InputDateReactiveHost);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const hostComponent = hostFixture.componentInstance;
    const hostInput = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(hostInput.value).toBe('2026-04-13');

    hostInput.value = '2026-04-15';
    hostInput.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();

    expect(hostComponent.form.controls.value.value).toEqual(new Date(2026, 3, 15));

    hostComponent.form.controls.value.setValue(new Date(2026, 3, 16));
    hostFixture.detectChanges();

    expect(hostInput.value).toBe('2026-04-16');

    hostComponent.form.controls.value.setValue(null);
    hostFixture.detectChanges();

    expect(hostInput.value).toBe('');

    hostComponent.form.controls.value.disable();
    hostFixture.detectChanges();

    expect(hostInput.disabled).toBe(true);
  });
});
