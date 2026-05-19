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
import { buildInputDateClasses } from './input-date.styles';
import { InputDateSize } from './input-date.types';
import { formatInputDateValue, parseInputDateValue } from './input-date.utils';

@Component({
  selector: 'ecom-input-date',
  imports: [],
  templateUrl: './input-date.html',
  styleUrl: './input-date.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [buildFormValueControlProvider(InputDate)],
  host: {
    '[class]': 'hostClasses()',
  },
})
export class InputDate implements FormValueControl<Date | string | null>, ControlValueAccessor {
  className = input('', { alias: 'class' });
  size = input<InputDateSize>('md');
  value = model<Date| string | null>(null);
  inputId = input<string>('');
  name = input<string>('');
  title = input<string>('');
  placeholder = input<string>('');
  disabled = input(false, { transform: booleanAttribute });
  readonly = input(false, { transform: booleanAttribute });
  required = input(false, { transform: booleanAttribute });

  private readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('inputElement');
  private readonly cvaDisabled = signal(false);
  private onChange: (value: Date | null) => void = () => {};
  private onTouched: () => void = () => {};

  hostClasses = computed(() => 'contents');
  isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  inputValue = computed(() => formatInputDateValue(this.value()));
  inputClasses = computed(() =>
    buildInputDateClasses({
      className: this.className(),
      size: this.size(),
    }),
  );

  onInput(event: Event): void {
    const nextValue = parseInputDateValue((event.target as HTMLInputElement).value);

    this.value.set(nextValue);
    this.onChange(nextValue);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: Date | null): void {
    this.value.set(value ?? null);
  }

  registerOnChange(fn: (value: Date | null) => void): void {
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
