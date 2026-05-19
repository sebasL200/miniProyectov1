import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { InputText } from './input-text';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, InputText],
  template: `
    <form [formGroup]="form">
      <ecom-input-text formControlName="value" />
    </form>
  `,
})
class InputTextReactiveHost {
  readonly form = new FormGroup({
    value: new FormControl('Initial value', { nonNullable: true }),
  });
}

describe('InputText', () => {
  let component: InputText;
  let fixture: ComponentFixture<InputText>;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputText, InputTextReactiveHost],
    }).compileComponents();

    fixture = TestBed.createComponent(InputText);
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

  it('should support custom input types', async () => {
    fixture.componentRef.setInput('type', 'password');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(input.type).toBe('password');
  });

  it('should update the model value on input events', () => {
    input.value = 'Updated value';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toBe('Updated value');
  });

  it('should work with formControlName', async () => {
    const hostFixture = TestBed.createComponent(InputTextReactiveHost);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const hostComponent = hostFixture.componentInstance;
    const hostInput = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(hostInput.value).toBe('Initial value');

    hostInput.value = 'Updated from UI';
    hostInput.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();

    expect(hostComponent.form.controls.value.value).toBe('Updated from UI');

    hostComponent.form.controls.value.setValue('Updated from control');
    hostFixture.detectChanges();

    expect(hostInput.value).toBe('Updated from control');

    hostComponent.form.controls.value.disable();
    hostFixture.detectChanges();

    expect(hostInput.disabled).toBe(true);
  });
});
