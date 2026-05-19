import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { Checkbox } from './checkbox';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Checkbox],
  template: `
    <form [formGroup]="form">
      <ecom-checkbox formControlName="accepted">Acepto</ecom-checkbox>
    </form>
  `,
})
class CheckboxReactiveHost {
  readonly form = new FormGroup({
    accepted: new FormControl(false, { nonNullable: true }),
  });
}

describe('Checkbox', () => {
  let component: Checkbox;
  let fixture: ComponentFixture<Checkbox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checkbox, CheckboxReactiveHost],
    }).compileComponents();

    fixture = TestBed.createComponent(Checkbox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update checked state on change', () => {
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.checked()).toBe(true);
  });

  it('should not update checked state when readonly', () => {
    fixture.componentRef.setInput('readonly', true);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.checked = true;
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.checked()).toBe(false);
    expect(input.checked).toBe(false);
  });

  it('should work with formControlName', async () => {
    const hostFixture = TestBed.createComponent(CheckboxReactiveHost);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const hostComponent = hostFixture.componentInstance;
    const hostInput = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(hostInput.checked).toBe(false);

    hostInput.checked = true;
    hostInput.dispatchEvent(new Event('change'));
    hostFixture.detectChanges();

    expect(hostComponent.form.controls.accepted.value).toBe(true);

    hostComponent.form.controls.accepted.setValue(false);
    hostFixture.detectChanges();

    expect(hostInput.checked).toBe(false);

    hostComponent.form.controls.accepted.disable();
    hostFixture.detectChanges();

    expect(hostInput.disabled).toBe(true);
  });
});
