import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Switch } from './switch';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, Switch],
  template: `
    <form [formGroup]="form">
      <ecom-switch formControlName="enabled">Activo</ecom-switch>
    </form>
  `,
})
class SwitchReactiveHost {
  readonly form = new FormGroup({
    enabled: new FormControl(false, { nonNullable: true }),
  });
}

describe('Switch', () => {
  let component: Switch;
  let fixture: ComponentFixture<Switch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Switch, SwitchReactiveHost],
    }).compileComponents();

    fixture = TestBed.createComponent(Switch);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update checked state on change', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.checked()).toBe(true);
  });

  it('should move the thumb when checked', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    const thumb: HTMLSpanElement = fixture.nativeElement.querySelector('input + span > span');

    expect(thumb.className).not.toContain('translate-x-5');

    input.checked = true;
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(thumb.className).toContain('translate-x-5');
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

  it('should reflect disabled state on the native input', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');

    expect(input.disabled).toBe(true);
  });

  it('should work with formControlName', async () => {
    const hostFixture = TestBed.createComponent(SwitchReactiveHost);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const hostComponent = hostFixture.componentInstance;
    const hostInput = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(hostInput.checked).toBe(false);

    hostInput.checked = true;
    hostInput.dispatchEvent(new Event('change'));
    hostFixture.detectChanges();

    expect(hostComponent.form.controls.enabled.value).toBe(true);

    hostComponent.form.controls.enabled.setValue(false);
    hostFixture.detectChanges();

    expect(hostInput.checked).toBe(false);

    hostComponent.form.controls.enabled.disable();
    hostFixture.detectChanges();

    expect(hostInput.disabled).toBe(true);
  });
});
