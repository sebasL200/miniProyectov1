import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Slot } from '@shared/directives/slot/slot';

import { Image } from './image';

@Component({
  imports: [Image, Slot],
  template: `
    <ecom-image size="xl" [src]="'/assets/example-image.png'" [alt]="'Example image'">
      <div slot="error" class="custom-error">No se pudo cargar la imagen.</div>
    </ecom-image>
  `,
})
class ImageWithErrorSlotHost {}

describe('Image', () => {
  let component: Image;
  let fixture: ComponentFixture<Image>;

  const setRequiredInputs = (): void => {
    fixture.componentRef.setInput('src', '/assets/example-image.png');
    fixture.componentRef.setInput('alt', 'Example image');
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Image, ImageWithErrorSlotHost],
    }).compileComponents();

    fixture = TestBed.createComponent(Image);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    setRequiredInputs();
    fixture.detectChanges();

    expect(component).toBeTruthy();
  });

  it('should apply the default medium image classes', () => {
    setRequiredInputs();
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(image.className).toContain('block');
    expect(image.className).toContain('h-auto');
    expect(image.className).toContain('max-w-full');
    expect(image.className).toContain('w-12');
  });

  it('should update the image classes when the size changes', async () => {
    setRequiredInputs();
    fixture.componentRef.setInput('size', '2xl');
    fixture.detectChanges();
    await fixture.whenStable();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(image.className).toContain('w-24');
  });

  it('should merge custom classes with the computed image classes', () => {
    setRequiredInputs();
    fixture.componentRef.setInput('class', 'rounded-full');
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(image.className).toContain('rounded-full');
    expect(image.className).toContain('w-12');
  });

  it('should render the default placeholder when the image fails and no error slot is projected', () => {
    setRequiredInputs();
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    const placeholder = fixture.nativeElement.querySelector('.image-placeholder') as HTMLDivElement;
    const icon = fixture.nativeElement.querySelector('.image-placeholder fa-icon') as HTMLElement;

    expect(placeholder).toBeTruthy();
    expect(icon).toBeTruthy();
    expect(placeholder.className).toContain('w-12');
  });

  it('should hide the default placeholder when a parent projects an error slot', async () => {
    const hostFixture = TestBed.createComponent(ImageWithErrorSlotHost);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const image = hostFixture.nativeElement.querySelector('img') as HTMLImageElement;
    image.dispatchEvent(new Event('error'));
    hostFixture.detectChanges();

    const customError = hostFixture.nativeElement.querySelector('.custom-error') as HTMLDivElement;
    const placeholder = hostFixture.nativeElement.querySelector('.image-placeholder') as HTMLDivElement;

    expect(customError).toBeTruthy();
    expect(customError.textContent).toContain('No se pudo cargar la imagen.');
    expect(getComputedStyle(placeholder).display).toBe('none');
  });

  it('should apply the selected image size to the projected error slot wrapper', async () => {
    const hostFixture = TestBed.createComponent(ImageWithErrorSlotHost);
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const image = hostFixture.nativeElement.querySelector('img') as HTMLImageElement;
    image.dispatchEvent(new Event('error'));
    hostFixture.detectChanges();
    await hostFixture.whenStable();

    const errorSlot = hostFixture.nativeElement.querySelector('.image-error-slot') as HTMLDivElement;

    expect(errorSlot).toBeTruthy();
    expect(errorSlot.className).toContain('w-20');
  });

  it('should try to render the image again when the src changes', async () => {
    setRequiredInputs();
    fixture.detectChanges();

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    image.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.image-placeholder')).toBeTruthy();

    fixture.componentRef.setInput('src', '/assets/updated-image.png');
    await fixture.whenStable();
    fixture.detectChanges();

    const updatedImage = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(updatedImage).toBeTruthy();
    expect(updatedImage.src).toContain('/assets/updated-image.png');
    expect(fixture.nativeElement.querySelector('.image-placeholder')).toBeNull();
  });
});
