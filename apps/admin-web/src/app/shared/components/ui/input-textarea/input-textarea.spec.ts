import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { InputTextarea } from './input-textarea';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, InputTextarea],
  template: `
    <form [formGroup]="form">
      <ecom-input-textarea formControlName="value" />
    </form>
  `,
})
class InputTextareaReactiveHost {
  readonly form = new FormGroup({
    value: new FormControl('Initial textarea value', { nonNullable: true }),
  });
}

describe('InputTextarea', () => {
  let component: InputTextarea;
  let fixture: ComponentFixture<InputTextarea>;
  let textarea: HTMLTextAreaElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputTextarea, InputTextareaReactiveHost],
    }).compileComponents();

    fixture = TestBed.createComponent(InputTextarea);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
    textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should apply the default textarea classes', () => {
    expect(textarea.className).toContain('min-h-28');
    expect(textarea.className).toContain('w-full');
    expect(textarea.className).toContain('border-border');
    expect(textarea.className).toContain('bg-background');
    expect(textarea.className).toContain('resize-y');
  });

  it('should update the textarea classes when the size changes', async () => {
    fixture.componentRef.setInput('size', 'xl');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(textarea.className).toContain('min-h-36');
    expect(textarea.className).toContain('text-xl');
    expect(textarea.className).not.toContain('min-h-28');
  });

  it('should merge custom classes into the textarea element', async () => {
    fixture.componentRef.setInput('class', 'rounded-xl');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(textarea.className).toContain('rounded-xl');
    expect(textarea.className).not.toContain('rounded-sm');
  });

  it('should support custom resize modes and rows', async () => {
    fixture.componentRef.setInput('resize', 'none');
    fixture.componentRef.setInput('rows', 6);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(textarea.className).toContain('resize-none');
    expect(textarea.rows).toBe(6);
  });

  it('should update the model value on input events', () => {
    textarea.value = 'Updated textarea value';
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.value()).toBe('Updated textarea value');
  });

  it('should work with formControlName', async () => {
    const hostFixture = TestBed.createComponent(InputTextareaReactiveHost);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const hostComponent = hostFixture.componentInstance;
    const hostTextarea = hostFixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

    expect(hostTextarea.value).toBe('Initial textarea value');

    hostTextarea.value = 'Updated from UI';
    hostTextarea.dispatchEvent(new Event('input'));
    hostFixture.detectChanges();

    expect(hostComponent.form.controls.value.value).toBe('Updated from UI');

    hostComponent.form.controls.value.setValue('Updated from control');
    hostFixture.detectChanges();

    expect(hostTextarea.value).toBe('Updated from control');

    hostComponent.form.controls.value.disable();
    hostFixture.detectChanges();

    expect(hostTextarea.disabled).toBe(true);
  });
});
