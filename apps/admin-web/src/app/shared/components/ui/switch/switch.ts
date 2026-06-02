import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  model,
  ModelSignal,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { FormCheckboxControl } from '@angular/forms/signals';
import { buildFormValueControlProvider } from '../../../utils/form-value-control-provider.builder';
import {
  buildSwitchInputClasses,
  buildSwitchLabelClasses,
  buildSwitchThumbClasses,
  buildSwitchTrackClasses,
  buildSwitchWrapperClasses,
} from './switch.styles';
import { SwitchSize, SwitchVariant } from './switch.types';

@Component({
  selector: 'ecom-switch',
  imports: [],
  templateUrl: './switch.html',
  styleUrl: './switch.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [buildFormValueControlProvider(Switch)],
  host: {
    '[class]': 'hostClasses()',
  },
})
export class Switch implements FormCheckboxControl, ControlValueAccessor {
  className = input('', { alias: 'class' });
  checked: ModelSignal<boolean> = model(false);
  variant = input<SwitchVariant>('primary');
  size = input<SwitchSize>('md');
  id = input('');
  name = input('');
  title = input('');
  disabled = input(false, { transform: booleanAttribute });
  readonly = input(false, { transform: booleanAttribute });
  required = input(false, { transform: booleanAttribute });

  private readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('inputElement');
  private readonly cvaDisabled = signal(false);
  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  readonly hostClasses = computed(() => 'contents');
  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  readonly wrapperClasses = computed(() =>
    buildSwitchWrapperClasses({
      className: this.className(),
      disabled: this.isDisabled(),
      readonly: this.readonly(),
    }),
  );
  readonly inputClasses = computed(() => buildSwitchInputClasses());
  readonly trackClasses = computed(() =>
    buildSwitchTrackClasses({
      size: this.size(),
      variant: this.variant(),
      readonly: this.readonly(),
    }),
  );
  readonly thumbClasses = computed(() =>
    buildSwitchThumbClasses({ size: this.size(), checked: this.checked() }),
  );
  readonly labelClasses = computed(() => buildSwitchLabelClasses({ size: this.size() }));

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

  focus(options?: FocusOptions): void {
    this.inputElement().nativeElement.focus(options);
  }
}
