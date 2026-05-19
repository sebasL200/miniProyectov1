import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { ControlValueAccessor } from '@angular/forms';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCheck, faChevronDown, faX } from '@fortawesome/free-solid-svg-icons';
import {
  buildInputSelectContainerClasses,
  buildInputSelectDropdownClasses,
  buildInputSelectIconClasses,
  buildInputSelectOptionClasses,
  buildInputSelectSearchInputClasses,
  buildInputSelectTriggerClasses,
  INPUT_SELECT_EMPTY_STATE_CLASSES,
  INPUT_SELECT_LABEL_CLASSES,
  INPUT_SELECT_OPTIONS_WRAPPER_CLASSES,
  INPUT_SELECT_SEARCH_WRAPPER_CLASSES,
} from './input-select.styles';
import { InputSelectDirection, InputSelectOption, InputSelectSize } from './input-select.types';
import { buildFormValueControlProvider } from '@shared/utils/form-value-control-provider.builder';
import { DEFAULT_OPTION } from './input-select.consts';
import { SelectOption } from './directives/select-option';
import { NgTemplateOutlet } from '@angular/common';
import { twMerge } from 'tailwind-merge';
import { Button } from "../button/button";

@Component({
  selector: 'ecom-input-select',
  imports: [FaIconComponent, NgTemplateOutlet, Button],
  templateUrl: './input-select.html',
  styleUrl: './input-select.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [buildFormValueControlProvider(InputSelect)],
  host: {
    '[class]': 'hostClasses()',
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscapeKey()',
  },
})
export class InputSelect
  implements FormValueControl<unknown | unknown[] | null>, ControlValueAccessor
{

  readonly faCheck = faCheck;
  readonly faX = faX;
  readonly className = input('', { alias: 'class' });
  readonly classNameOptionsList = input('');
  readonly options = input<InputSelectOption[]>([]);
  readonly showDefaultOption = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { alias: 'invalid', transform: booleanAttribute });
  readonly readonly = input(false, { alias: 'readOnly', transform: booleanAttribute });
  readonly size = input<InputSelectSize>('md');
  readonly searchable = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly name = input('');
  readonly id = input('input-select');
  readonly title = input('');
  readonly required = input(false, { transform: booleanAttribute });
  readonly externalModel = input<InputSelectOption | null | undefined>(undefined, {
    alias: 'model',
  });

  readonly maxChipsVisible = input(3);
  readonly placeholder = input('--------------');

  readonly multiple = input(false, { transform: booleanAttribute });

  readonly template = contentChild(SelectOption);

  readonly open = model(false);
  readonly touched = model(false);
  readonly value = model<unknown | unknown[] | null>(null);
  readonly model = signal<InputSelectOption | null>(null);
  readonly modelChange = output<InputSelectOption | null>();
  readonly search = output<string>();
  readonly scrollToEnd = output<void>();
  private hasEmittedScrollEnd = false;

  protected readonly faChevronDown = faChevronDown;

  private readonly containerElement = viewChild<ElementRef<HTMLElement>>('selectElement');
  private readonly triggerElement = viewChild<ElementRef<HTMLButtonElement>>('triggerElement');
  private readonly searchInputElement = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly cvaDisabled = signal(false);
  private onChange: (value: unknown | null) => void = () => {};
  private onTouched: () => void = () => {};

  protected readonly hostClasses = computed(() => 'contents');
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly direction = signal<InputSelectDirection>('down');
  protected readonly rootClasses = computed(() =>
    buildInputSelectContainerClasses({
      className: this.className(),
    }),
  );
  protected readonly triggerClasses = computed(() =>
    buildInputSelectTriggerClasses({
      size: this.size(),
      invalid: this.invalid(),
      disabled: this.isDisabled(),
      readonly: this.readonly(),
      open: this.open(),
    }),
  );
  protected readonly iconClasses = computed(() =>
    buildInputSelectIconClasses({
      open: this.open(),
    }),
  );
  protected readonly dropdownClasses = computed(() =>
    buildInputSelectDropdownClasses({
      open: this.open(),
      direction: this.direction(),
    }),
  );
  protected readonly labelClasses = computed(() => INPUT_SELECT_LABEL_CLASSES);
  protected readonly optionsWrapperClasses = computed(() =>
    twMerge(INPUT_SELECT_OPTIONS_WRAPPER_CLASSES, this.classNameOptionsList()),
  );
  protected readonly searchWrapperClasses = computed(() => INPUT_SELECT_SEARCH_WRAPPER_CLASSES);
  protected readonly searchInputClasses = computed(() =>
    buildInputSelectSearchInputClasses(this.size()),
  );
  protected readonly emptyStateClasses = computed(() => INPUT_SELECT_EMPTY_STATE_CLASSES);
  protected readonly searchTerm = signal('');
  readonly displayLabel = computed(() => {
    if (this.multiple()) {
      const labels = this.selectedOptions().map((o) => o.label);
      if (!labels.length) return '--------------';
      return labels.join(', ');
    }
    return this.model()?.label ?? '--------------';
  });

  readonly selectedOptions = computed(() => {
    if (!this.multiple()) return [];
    const values = (this.value() as unknown[]) ?? [];
    return values.map((value) => this.findOptionByValue(value) ?? this.optionFromValue(value));
  });

  protected readonly isDirectionUp = computed(() => this.direction() === 'up');
  protected readonly normalizedOptions = computed(() => {
    const options = this.options();

    if (!this.showDefaultOption()) {
      return options;
    }

    const hasDefaultOption = options.some(
      (option) => option.value === DEFAULT_OPTION.value && option.label === DEFAULT_OPTION.label,
    );

    return hasDefaultOption ? options : [DEFAULT_OPTION, ...options];
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

  protected onOptionKeydown(event: KeyboardEvent, option: InputSelectOption): void {
    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    this.onSelect(option);
  }

  protected onSearchInput(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
    this.search.emit(this.searchTerm());
  }

  protected onSelect(option: InputSelectOption): void {
    if (this.isDisabled() || this.readonly() || option.disabled) {
      return;
    }

    if (this.multiple()) {
      const current = (this.value() as unknown[]) ?? [];
      const exists = current.some((v) => this.sameValue(v, option.value));
      const next = exists
        ? current.filter((v) => !this.sameValue(v, option.value))
        : [...current, option.value];
      this.value.set(next);
      this.onChange(next);
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

  protected isSelected(option: InputSelectOption): boolean {
    if (this.multiple()) {
      return ((this.value() as unknown[]) ?? []).some((v) => this.sameValue(v, option.value));
    }
    return this.sameValue(this.model()?.value, option.value);
  }

  protected optionClasses(option: InputSelectOption): string {
    return buildInputSelectOptionClasses({
      size: this.size(),
      selected: this.isSelected(option),
      disabled: !!option.disabled,
    });
  }

  protected trackByOption(index: number, option: InputSelectOption): string {
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

  private findOptionByValue(value: unknown | null): InputSelectOption | null {
    const options = this.normalizedOptions();

    if (value === null && this.showDefaultOption()) {
      return (
        options.find(
          (option) =>
            option.value === DEFAULT_OPTION.value && option.label === DEFAULT_OPTION.label,
        ) ?? DEFAULT_OPTION
      );
    }

    return options.find((option) => this.sameValue(option.value, value)) ?? null;
  }

  private optionFromValue(value: unknown): InputSelectOption {
    if (this.isRecord(value)) {
      const label = value['label'] ?? value['name'] ?? value['id'];
      return {
        label: String(label ?? ''),
        value,
      };
    }

    return {
      label: String(value ?? ''),
      value,
    };
  }

  private sameValue(first: unknown, second: unknown): boolean {
    if (Object.is(first, second)) {
      return true;
    }

    if (!this.isRecord(first) || !this.isRecord(second)) {
      return false;
    }

    return (
      'id' in first &&
      'id' in second &&
      first['id'] !== undefined &&
      Object.is(first['id'], second['id'])
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  private sameOption(
    currentOption: InputSelectOption | null,
    nextOption: InputSelectOption | null,
  ): boolean {
    if (currentOption === nextOption) {
      return true;
    }

    if (!currentOption || !nextOption) {
      return false;
    }

    return (
      currentOption.label === nextOption.label &&
      currentOption.disabled === nextOption.disabled &&
      this.sameValue(currentOption.value, nextOption.value)
    );
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 1;
    if (isAtBottom && !this.hasEmittedScrollEnd) {
      this.scrollToEnd.emit();
      this.hasEmittedScrollEnd = true;
    }

    if (!isAtBottom) {
      this.hasEmittedScrollEnd = false;
    }
  }

  onRemoveChip(event: MouseEvent, option: InputSelectOption): void {
    event.stopPropagation(); // evita abrir/cerrar el dropdown
    if (this.isDisabled() || this.readonly() || option.disabled) {
      return;
    }

    const current = (this.value() as unknown[]) ?? [];
    const next = current.filter((v) => !this.sameValue(v, option.value));
    this.value.set(next);
    this.onChange(next);
  }

  onClearAll(): void {
    if (this.isDisabled() || this.readonly()) {
      return;
    }

    const current = (this.value() as unknown[]) ?? [];
    const next = current.filter((value) => {
      const option = this.findOptionByValue(value);
      return option?.disabled;
    });
    this.value.set(next);
    this.onChange(next);
  }
}
