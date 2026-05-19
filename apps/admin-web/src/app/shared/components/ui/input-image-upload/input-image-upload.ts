import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { buildFormValueControlProvider } from '@shared/utils/form-value-control-provider.builder';
import { buildInputImageUploadClasses } from './input-image-upload.styles';
import {
  InputImageUploadConfig,
  InputImageUploadSize,
  InputImageUploadValue,
  InputImageUploadValueType,
} from './input-image-upload.types';

const DEFAULT_INPUT_IMAGE_UPLOAD_CONFIG: Required<InputImageUploadConfig> = {
  valueType: 'file',
  multiple: true,
  allowedTypes: ['image/'],
  maxFileSizeBytes: Number.POSITIVE_INFINITY,
  maxDataUrlLength: Number.POSITIVE_INFINITY,
};

@Component({
  selector: 'ecom-input-image-upload',
  imports: [],
  templateUrl: './input-image-upload.html',
  styleUrl: './input-image-upload.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [buildFormValueControlProvider(InputImageUpload)],
  host: {
    '[class]': 'hostClasses()',
  },
})
export class InputImageUpload
  implements FormValueControl<InputImageUploadValue>, ControlValueAccessor
{
  readonly className = input('', { alias: 'class' });
  readonly size = input<InputImageUploadSize>('md');
  readonly value = model<InputImageUploadValue>([]);
  readonly inputId = input<string>('');
  readonly name = input<string>('');
  readonly title = input<string>('Subir imágenes');
  readonly accept = input<string>('image/*');
  readonly multiple = input(true, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly config = input<InputImageUploadConfig>({});

  private readonly inputElement =
    viewChild<ElementRef<HTMLInputElement>>('inputElement');
  private readonly cvaDisabled = signal(false);
  private readonly dragging = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  private onChange: (value: InputImageUploadValue) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly hostClasses = computed(() => 'contents');
  protected readonly effectiveConfig = computed(() => ({
    ...DEFAULT_INPUT_IMAGE_UPLOAD_CONFIG,
    ...this.config(),
  }));
  protected readonly effectiveMultiple = computed(
    () => this.config().multiple ?? this.multiple(),
  );
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );
  protected readonly rootClasses = computed(() =>
    buildInputImageUploadClasses({
      className: this.className(),
      dragging: this.dragging(),
      disabled: this.isDisabled(),
      multiple: this.effectiveMultiple(),
      readonly: this.readonly(),
      size: this.size(),
    }),
  );
  protected readonly hasFiles = computed(() => this.value().length > 0);
  protected readonly actionTitle = computed(() =>
    this.effectiveMultiple()
      ? this.title()
      : this.title() === 'Subir imágenes'
        ? 'Subir imagen'
        : this.title(),
  );
  protected readonly promptText = computed(() =>
    this.effectiveMultiple()
      ? 'Arrastra imágenes aquí o selecciona archivos'
      : 'Arrastra una imagen aquí o selecciona un archivo',
  );
  protected readonly valueTypeDescription = computed(() => {
    if (this.valueType() === 'data-url') {
      return this.effectiveMultiple()
        ? 'Las imágenes se guardarán como Data URL.'
        : 'La imagen se guardará como Data URL.';
    }

    return this.effectiveMultiple()
      ? 'Los archivos se mantienen en el cliente hasta enviar el formulario.'
      : 'El archivo se mantiene en el cliente hasta enviar el formulario.';
  });
  protected readonly valueType = computed<InputImageUploadValueType>(
    () => this.effectiveConfig().valueType,
  );
  protected readonly maxFileSizeLegend = computed(() => {
    const maxFileSizeBytes = this.config().maxFileSizeBytes;

    return typeof maxFileSizeBytes === 'number' &&
      Number.isFinite(maxFileSizeBytes)
      ? `Tamaño máximo ${this.effectiveMultiple() ? 'por imagen' : 'de imagen'}: ${this.formatFileSize(maxFileSizeBytes)}.`
      : null;
  });

  writeValue(value: InputImageUploadValue | null): void {
    this.value.set(value ?? []);
    this.clearNativeInput();
  }

  registerOnChange(fn: (value: InputImageUploadValue) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected openFilePicker(): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }

    this.inputElement()?.nativeElement.click();
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    this.openFilePicker();
  }

  protected onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;

    void this.commitFiles(Array.from(input.files ?? []));
  }

  protected onDragOver(event: DragEvent): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }

    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
  }

  protected onDrop(event: DragEvent): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }

    event.preventDefault();
    this.dragging.set(false);
    void this.commitFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  protected removeFile(index: number, event: MouseEvent): void {
    event.stopPropagation();

    if (this.isDisabled() || this.readonly()) {
      return;
    }

    const nextValue = this.value().filter(
      (_, fileIndex) => fileIndex !== index,
    );
    this.commitValue(nextValue as InputImageUploadValue);
    this.clearNativeInput();
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected itemName(item: File | string, index: number): string {
    return item instanceof File ? item.name : `Imagen ${index + 1}`;
  }

  protected itemMeta(item: File | string): string {
    return item instanceof File ? this.formatFileSize(item.size) : '';
  }

  protected itemPreviewUrl(item: File | string): string | null {
    return typeof item === 'string' ? item : null;
  }

  protected formatFileSize(size: number): string {
    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected trackFile(index: number, item: File | string): string {
    if (item instanceof File) {
      return `${item.name}-${item.size}-${item.lastModified}-${index}`;
    }

    return `${item.slice(0, 80)}-${index}`;
  }

  private async commitFiles(files: File[]): Promise<void> {
    this.errorMessage.set(null);

    if (files.length === 0) {
      this.onTouched();
      return;
    }

    try {
      const imageFiles = this.validateFiles(files);
      const nextValue = await this.toValue(imageFiles);

      this.commitValue(
        (this.effectiveMultiple()
          ? [...this.value(), ...nextValue]
          : nextValue.slice(0, 1)) as InputImageUploadValue,
      );
      this.clearNativeInput();
    } catch (error) {
      this.errorMessage.set(
        error instanceof Error
          ? error.message
          : 'No se pudieron cargar las imágenes.',
      );
      this.onTouched();
      this.clearNativeInput();
    }
  }

  private commitValue(value: InputImageUploadValue): void {
    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }

  private validateFiles(files: File[]): File[] {
    const imageFiles = files.filter((file) => this.isAllowedImage(file));
    const maxFileSizeBytes = this.effectiveConfig().maxFileSizeBytes;

    if (imageFiles.length !== files.length) {
      throw new Error('Solo se pueden cargar archivos de imagen permitidos.');
    }

    if (imageFiles.some((file) => file.size > maxFileSizeBytes)) {
      throw new Error(
        `Cada imagen debe pesar máximo ${this.formatFileSize(maxFileSizeBytes)}.`,
      );
    }

    return imageFiles;
  }

  private isAllowedImage(file: File): boolean {
    return this.effectiveConfig().allowedTypes.some((type) =>
      type.endsWith('/') ? file.type.startsWith(type) : file.type === type,
    );
  }

  private async toValue(files: File[]): Promise<InputImageUploadValue> {
    if (this.valueType() === 'file') {
      return files;
    }

    const dataUrls = await Promise.all(
      files.map((file) => this.readFileAsDataUrl(file)),
    );
    const maxDataUrlLength = this.effectiveConfig().maxDataUrlLength;

    if (dataUrls.some((dataUrl) => dataUrl.length > maxDataUrlLength)) {
      throw new Error('Una o más imágenes exceden el tamaño permitido.');
    }

    return dataUrls;
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }

        reject(new Error('No se pudo leer el archivo.'));
      };
      reader.onerror = () => reject(new Error('No se pudo leer el archivo.'));
      reader.readAsDataURL(file);
    });
  }

  private clearNativeInput(): void {
    const inputElement = this.inputElement();

    if (!inputElement) {
      return;
    }

    inputElement.nativeElement.value = '';
  }
}
