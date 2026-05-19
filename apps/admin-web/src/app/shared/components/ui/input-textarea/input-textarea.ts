import {
  afterNextRender,
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
import { buildInputTextareaClasses } from './input-textarea.styles';
import { InputTextareaResize, InputTextareaSize } from './input-textarea.types';

@Component({
  selector: 'ecom-input-textarea',
  imports: [],
  templateUrl: './input-textarea.html',
  styleUrl: './input-textarea.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [buildFormValueControlProvider(InputTextarea)],
  host: {
    '[class]': 'hostClasses()',
  },
})
export class InputTextarea
  implements FormValueControl<string>, ControlValueAccessor
{
  readonly className = input('', { alias: 'class' });
  readonly size = input<InputTextareaSize>('md');
  readonly resize = input<InputTextareaResize>('vertical');
  readonly rows = input(4);
  readonly autoGrow = input(false, { transform: booleanAttribute });
  readonly value = model<string>('');
  readonly inputId = input<string>('');
  readonly name = input<string>('');
  readonly title = input<string>('');
  readonly placeholder = input<string>('Write here...');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });

  private readonly textareaElement =
    viewChild.required<ElementRef<HTMLTextAreaElement>>('textareaElement');
  private readonly cvaDisabled = signal(false);
  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly hostClasses = computed(() => 'contents');
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );
  protected readonly textareaClasses = computed(() =>
    buildInputTextareaClasses({
      className: this.className(),
      size: this.size(),
      resize: this.resize(),
    }),
  );
  protected readonly minHeight = computed(() =>
    this.rows() <= 1 ? 'auto' : null,
  );

  constructor() {
    afterNextRender(() => this.syncAutoGrowHeight());
  }

  protected onInput(event: Event): void {
    const nextValue = (event.target as HTMLTextAreaElement).value;

    this.value.set(nextValue);
    this.onChange(nextValue);
    this.syncAutoGrowHeight();
  }

  protected onBlur(): void {
    this.onTouched();
  }

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
    queueMicrotask(() => this.syncAutoGrowHeight());
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
    this.textareaElement().nativeElement.focus(options);
  }

  private syncAutoGrowHeight(): void {
    const textareaRef = this.textareaElement();
    if (!textareaRef) {
      return;
    }

    const textarea = textareaRef.nativeElement;

    if (!this.autoGrow()) {
      textarea.style.height = '';
      textarea.style.overflowY = '';
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.overflowY = 'hidden';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }
}
