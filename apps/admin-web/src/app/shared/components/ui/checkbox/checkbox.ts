import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  InputSignal,
  model,
  ModelSignal,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { FormCheckboxControl } from '@angular/forms/signals';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { buildFormValueControlProvider } from '@shared/utils/form-value-control-provider.builder';

import {
  buildCheckboxClasses,
  buildCheckboxLabelClasses,
  buildCheckboxWrapperClasses,
} from './checkbox.styles';
import { CheckboxSize, CheckboxVariant } from './checkbox.types';

@Component({
  selector: 'ecom-checkbox',
  imports: [FontAwesomeModule],
  templateUrl: './checkbox.html',
  styleUrl: './checkbox.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [buildFormValueControlProvider(Checkbox)],
  host: {
    '[class]': 'hostClasses()',
  },
})
export class Checkbox implements FormCheckboxControl, ControlValueAccessor {
  className = input('', { alias: 'class' });
  checked: ModelSignal<boolean> = model(false);
  variant: InputSignal<CheckboxVariant> = input<CheckboxVariant>('primary');
  size: InputSignal<CheckboxSize> = input<CheckboxSize>('md');
  id = input('');
  name = input('');
  title = input('');
  disabled = input(false, { transform: booleanAttribute });
  readonly = input(false, { transform: booleanAttribute });
  required = input(false, { transform: booleanAttribute });

  readonly faCheck = faCheck;
  private readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('inputElement');
  private readonly cvaDisabled = signal(false);
  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  hostClasses = computed(() => 'contents');
  isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  wrapperClasses = computed(() =>
    buildCheckboxWrapperClasses({
      className: this.className(),
      disabled: this.isDisabled(),
      readonly: this.readonly(),
    }),
  );

  checkboxClasses = computed(() =>
    buildCheckboxClasses({ size: this.size(), variant: this.variant() }),
  );

  labelClasses = computed(() => buildCheckboxLabelClasses({ size: this.size() }));

  iconClasses = computed(() => {
    const sizeMap: Record<CheckboxSize, string> = {
      sm: 'text-[9px]',
      md: 'text-[11px]',
      lg: 'text-[13px]',
    };
    return [
      'absolute inset-0 m-auto',
      'flex items-center justify-center',
      'pointer-events-none text-white',
      'transition-opacity duration-200',
      sizeMap[this.size()],
      this.checked() ? 'opacity-100' : 'opacity-0',
    ].join(' ');
  });

  onInputClick(event: MouseEvent): void {
    if (!this.readonly()) {
      return;
    }

    event.preventDefault();
  }

  onCheckedChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (this.readonly()) {
      input.checked = this.checked();
      return;
    }

    this.checked.set(input.checked);
    this.onChange(input.checked);
  }

  onBlur(): void {
    this.onTouched();
  }

  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
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
