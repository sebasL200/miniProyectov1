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
import { buildFormValueControlProvider } from '../../../utils/form-value-control-provider.builder';
import { buildInputTextClasses } from './input-text.styles';
import { InputTextSize, InputTextType } from './input-text.types';

@Component({
  selector: 'ecom-input-text',
  imports: [],
  templateUrl: './input-text.html',
  styleUrl: './input-text.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [buildFormValueControlProvider(InputText)],
  host: {
    '[class]': 'hostClasses()',
  },
})
// TODO: Evaluar si este control debe exponer mas estado de Signal Forms
// TODO: Exponer readonly, required, invalid y touched si queremos sincronizacion mas completa con [formField]
// TODO: Revisar si el placeholder por defecto debe quedar en espanol para mantener consistencia con el resto de la UI
export class InputText implements FormValueControl<string>, ControlValueAccessor {
  className = input('', { alias: 'class' });
  size = input<InputTextSize>('md');
  type = input<InputTextType>('text');
  value = model<string>('');
  inputId = input<string>('');
  name = input<string>('');
  title = input<string>('');
  placeholder = input<string>('Enter text...');
  disabled = input(false, { transform: booleanAttribute });
  readonly = input(false, { transform: booleanAttribute });
  required = input(false, { transform: booleanAttribute });

  private readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('inputElement');
  private readonly cvaDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  hostClasses = computed(() => 'contents');
  isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  inputClasses = computed(() =>
    buildInputTextClasses({
      className: this.className(),
      size: this.size(),
    }),
  );

  onInput(event: Event): void {
    const nextValue = (event.target as HTMLInputElement).value;

    this.value.set(nextValue);
    this.onChange(nextValue);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  focus(options?: FocusOptions): void {
    this.inputElement().nativeElement.focus(options);
  }
}
