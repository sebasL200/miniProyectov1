import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { InputImageUpload } from './input-image-upload';
import { InputImageUploadConfig } from './input-image-upload.types';

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, InputImageUpload],
  template: `
    <form [formGroup]="form">
      <ecom-input-image-upload formControlName="images" />
    </form>
  `,
})
class InputImageUploadReactiveHost {
  readonly form = new FormGroup({
    images: new FormControl<File[]>([], { nonNullable: true }),
  });
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, InputImageUpload],
  template: `
    <form [formGroup]="form">
      <ecom-input-image-upload formControlName="images" [config]="config" />
    </form>
  `,
})
class InputImageUploadDataUrlHost {
  readonly config: InputImageUploadConfig = {
    valueType: 'data-url',
    allowedTypes: ['image/png'],
    maxFileSizeBytes: 1024,
    maxDataUrlLength: 3000,
  };
  readonly form = new FormGroup({
    images: new FormControl<string[]>([], { nonNullable: true }),
  });
}

@Component({
  standalone: true,
  imports: [InputImageUpload],
  template: `
    <ecom-input-image-upload
      [config]="{
        valueType: 'data-url',
        maxDataUrlLength: 3000,
      }"
    />
  `,
})
class InputImageUploadDataUrlLimitOnlyHost {}

describe('InputImageUpload', () => {
  let component: InputImageUpload;
  let fixture: ComponentFixture<InputImageUpload>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        InputImageUpload,
        InputImageUploadReactiveHost,
        InputImageUploadDataUrlHost,
        InputImageUploadDataUrlLimitOnlyHost,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InputImageUpload);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('works with formControlName', async () => {
    const hostFixture = TestBed.createComponent(InputImageUploadReactiveHost);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const hostComponent = hostFixture.componentInstance;
    const file = new File(['content'], 'image.png', { type: 'image/png' });

    hostComponent.form.controls.images.setValue([file]);
    hostFixture.detectChanges();

    expect(hostComponent.form.controls.images.value).toEqual([file]);

    hostComponent.form.controls.images.disable();
    hostFixture.detectChanges();

    const input = hostFixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;

    expect(input.disabled).toBe(true);
  });

  it('converts selected files to data urls when configured', async () => {
    const hostFixture = TestBed.createComponent(InputImageUploadDataUrlHost);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const input = hostFixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const file = new File(['content'], 'image.png', { type: 'image/png' });

    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });
    input.dispatchEvent(new Event('change'));
    await waitFor(() => {
      expect(
        hostFixture.componentInstance.form.controls.images.value,
      ).toHaveLength(1);
    });
    await hostFixture.whenStable();
    hostFixture.detectChanges();

    const value = hostFixture.componentInstance.form.controls.images.value;
    expect(value).toHaveLength(1);
    expect(value[0]).toMatch(/^data:image\/png;base64,/);
  });

  it('shows a local validation message for disallowed image types', async () => {
    const hostFixture = TestBed.createComponent(InputImageUploadDataUrlHost);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const input = hostFixture.nativeElement.querySelector(
      'input',
    ) as HTMLInputElement;
    const file = new File(['content'], 'image.gif', { type: 'image/gif' });

    Object.defineProperty(input, 'files', {
      value: [file],
      configurable: true,
    });
    input.dispatchEvent(new Event('change'));
    await hostFixture.whenStable();
    hostFixture.detectChanges();

    expect(hostFixture.componentInstance.form.controls.images.value).toEqual(
      [],
    );
    expect(
      hostFixture.debugElement.query(By.css('.text-destructive')).nativeElement
        .textContent,
    ).toContain('Solo se pueden cargar archivos de imagen permitidos.');
  });

  it('shows the max file size legend when configured', async () => {
    const hostFixture = TestBed.createComponent(InputImageUploadDataUrlHost);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    expect(hostFixture.nativeElement.textContent).toContain(
      'Tamaño máximo por imagen: 1.0 KB.',
    );
  });

  it('does not show a legend for the max data url length only', async () => {
    const hostFixture = TestBed.createComponent(
      InputImageUploadDataUrlLimitOnlyHost,
    );
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    expect(hostFixture.nativeElement.textContent).not.toContain(
      'Tamaño máximo por imagen',
    );
    expect(hostFixture.nativeElement.textContent).not.toContain('3000');
  });
});

async function waitFor(assertion: () => void): Promise<void> {
  let lastError: unknown;

  for (let attempt = 0; attempt < 10; attempt += 1) {
    try {
      assertion();
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  throw lastError;
}
