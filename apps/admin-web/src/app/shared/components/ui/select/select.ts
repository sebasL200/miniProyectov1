import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { buildFormValueControlProvider } from '../../../utils/form-value-control-provider.builder';
import { buildPlaceholderOption } from './select.consts';
import {
  buildSelectContainerClasses,
  buildSelectDropdownClasses,
  buildSelectIconClasses,
  buildSelectOptionClasses,
  buildSelectOptionIndicatorClasses,
  buildSelectSearchInputClasses,
  buildSelectTriggerClasses,
  SELECT_EMPTY_STATE_CLASSES,
  SELECT_LABEL_CLASSES,
  SELECT_OPTION_LABEL_CLASSES,
  SELECT_OPTIONS_WRAPPER_CLASSES,
  SELECT_SEARCH_WRAPPER_CLASSES,
} from './select.styles';
import { SelectDirection, SelectOption, SelectSize } from './select.types';

@Component({
  selector: 'ecom-select',
  imports: [FaIconComponent],
  templateUrl: './select.html',
  styleUrl: './select.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [buildFormValueControlProvider(Select)],
  host: {
    '[class]': 'hostClasses()',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscapeKey()',
  },
})
export class Select implements FormValueControl<unknown | null>, ControlValueAccessor {
  readonly className = input('', { alias: 'class' });
  readonly options = input<SelectOption[]>([]);
  readonly placeholder = input('Selecciona una opcion');
  readonly showPlaceholderOption = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { alias: 'readOnly', transform: booleanAttribute });
  readonly size = input<SelectSize>('md');
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly name = input('');
  readonly id = input('select');
  readonly title = input('');
  readonly required = input(false, { transform: booleanAttribute });
  readonly externalModel = input<SelectOption | null | undefined>(undefined, {
    alias: 'model',
  });

  readonly open = model(false);
  readonly touched = model(false);
  readonly value = model<unknown | null>(null);
  readonly model = signal<SelectOption | null>(null);
  readonly modelChange = output<SelectOption | null>();

  protected readonly faChevronDown = faChevronDown;
  protected readonly faCheck = faCheck;

  private readonly containerElement = viewChild<ElementRef<HTMLElement>>('selectElement');
  private readonly triggerElement = viewChild<ElementRef<HTMLButtonElement>>('triggerElement');
  private readonly searchInputElement = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly cvaDisabled = signal(false);
  private onChange: (value: unknown | null) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly hostClasses = computed(() => 'contents');
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly direction = signal<SelectDirection>('down');
  protected readonly rootClasses = computed(() =>
    buildSelectContainerClasses({
      className: this.className(),
    }),
  );
  protected readonly triggerClasses = computed(() =>
    buildSelectTriggerClasses({
      size: this.size(),
      invalid: this.invalid(),
      disabled: this.isDisabled(),
      readonly: this.readonly(),
      open: this.open(),
    }),
  );
  protected readonly iconClasses = computed(() =>
    buildSelectIconClasses({
      open: this.open(),
    }),
  );
  protected readonly dropdownClasses = computed(() =>
    buildSelectDropdownClasses({
      open: this.open(),
      direction: this.direction(),
    }),
  );
  protected readonly labelClasses = computed(() => SELECT_LABEL_CLASSES);
  protected readonly optionsWrapperClasses = computed(() => SELECT_OPTIONS_WRAPPER_CLASSES);
  protected readonly searchWrapperClasses = computed(() => SELECT_SEARCH_WRAPPER_CLASSES);
  protected readonly searchInputClasses = computed(() => buildSelectSearchInputClasses(this.size()));
  protected readonly emptyStateClasses = computed(() => SELECT_EMPTY_STATE_CLASSES);
  protected readonly optionLabelClasses = computed(() => SELECT_OPTION_LABEL_CLASSES);
  protected readonly searchTerm = signal('');
  protected readonly displayLabel = computed(() => this.model()?.label ?? this.placeholder());
  protected readonly normalizedOptions = computed(() => {
    const options = this.options();

    if (!this.showPlaceholderOption()) {
      return options;
    }

    const placeholderOption = buildPlaceholderOption(this.placeholder());
    const hasPlaceholderOption = options.some(
      (option) => Object.is(option.value, placeholderOption.value) && option.label === placeholderOption.label,
    );

    return hasPlaceholderOption ? options : [placeholderOption, ...options];
  });
  protected readonly filteredOptions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const options = this.normalizedOptions();

    if (!this.searchable() || term.length === 0) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(term));
  });

  constructor() {
    effect(() => {
      const externalModel = this.externalModel();

      if (externalModel === undefined) {
        return;
      }

      const nextValue = externalModel?.value ?? null;

      if (
        !Object.is(
          untracked(() => this.value()),
          nextValue,
        )
      ) {
        this.value.set(nextValue);
      }
    });

    effect(() => {
      const nextModel = this.findOptionByValue(this.value());

      if (!this.sameOption(this.model(), nextModel)) {
        this.model.set(nextModel);
        this.modelChange.emit(nextModel);
      }
    });

    effect(() => {
      if (this.isDisabled() && this.open()) {
        this.open.set(false);
      }
    });

    effect(() => {
      if (!this.open()) {
        this.direction.set('down');
        this.searchTerm.set('');
        return;
      }

      queueMicrotask(() => {
        this.calculateDropdownDirection();
        this.searchInputElement()?.nativeElement.focus();
      });
    });
  }

  writeValue(value: unknown | null): void {
    this.value.set(value);
  }

  registerOnChange(fn: (value: unknown | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected toggleDropdown(): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }

    if (this.open()) {
      this.closeDropdown();
      return;
    }

    this.open.set(true);
  }

  protected onTriggerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggleDropdown();
      return;
    }

    if (event.key === 'ArrowDown' && !this.open()) {
      event.preventDefault();
      this.open.set(true);
    }
  }

  protected onOptionKeydown(event: KeyboardEvent, option: SelectOption): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    this.onSelect(option);
  }

  protected onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected onSelect(option: SelectOption): void {
    if (this.isDisabled() || this.readonly() || option.disabled) {
      return;
    }

    this.value.set(option.value);
    this.onChange(option.value);
    this.closeDropdown();
  }

  protected onFocusOut(event: FocusEvent): void {
    const container = this.containerElement()?.nativeElement;
    const relatedTarget = event.relatedTarget as Node | null;

    if (!container || (relatedTarget && container.contains(relatedTarget))) {
      return;
    }

    if (this.open()) {
      this.open.set(false);
      this.direction.set('down');
      this.searchTerm.set('');
    }

    this.markTouched();
  }

  protected onDocumentClick(event: MouseEvent): void {
    const container = this.containerElement()?.nativeElement;
    const target = event.target as Node | null;

    if (!container || !target) {
      return;
    }

    if (this.open() && !container.contains(target)) {
      this.closeDropdown();
    }
  }

  protected onEscapeKey(): void {
    if (this.open()) {
      this.closeDropdown();
    }
  }

  protected isSelected(option: SelectOption): boolean {
    return Object.is(this.model()?.value, option.value);
  }

  protected optionClasses(option: SelectOption): string {
    return buildSelectOptionClasses({
      size: this.size(),
      selected: this.isSelected(option),
      disabled: !!option.disabled,
    });
  }

  protected optionIndicatorClasses(option: SelectOption): string {
    return buildSelectOptionIndicatorClasses({
      selected: this.isSelected(option),
    });
  }

  protected trackByOption(index: number, option: SelectOption): string {
    return `${String(option.value)}-${option.label}-${index}`;
  }

  focus(options?: FocusOptions): void {
    this.triggerElement()?.nativeElement.focus(options);
  }

  private closeDropdown(): void {
    this.open.set(false);
    this.direction.set('down');
    this.searchTerm.set('');
    this.markTouched();
  }

  private markTouched(): void {
    if (!this.touched()) {
      this.touched.set(true);
    }

    this.onTouched();
  }

  private calculateDropdownDirection(): void {
    const container = this.containerElement()?.nativeElement;

    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const estimatedMenuHeight = 248;
    const spaceBelow = viewportHeight - containerRect.bottom;
    const spaceAbove = containerRect.top;

    if (spaceBelow < estimatedMenuHeight && spaceAbove > spaceBelow) {
      this.direction.set('up');
      return;
    }

    this.direction.set('down');
  }

  private findOptionByValue(value: unknown | null): SelectOption | null {
    const options = this.normalizedOptions();

    if (value === null && this.showPlaceholderOption()) {
      const placeholderOption = buildPlaceholderOption(this.placeholder());

      return (
        options.find(
          (option) =>
            Object.is(option.value, placeholderOption.value) &&
            option.label === placeholderOption.label,
        ) ?? placeholderOption
      );
    }

    return options.find((option) => Object.is(option.value, value)) ?? null;
  }

  private sameOption(currentOption: SelectOption | null, nextOption: SelectOption | null): boolean {
    if (currentOption === nextOption) {
      return true;
    }

    if (!currentOption || !nextOption) {
      return false;
    }

    return (
      currentOption.label === nextOption.label &&
      currentOption.disabled === nextOption.disabled &&
      Object.is(currentOption.value, nextOption.value)
    );
  }
}
