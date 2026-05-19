import {
  afterNextRender,
  computed,
  effect,
  InputSignal,
  OutputEmitterRef,
  signal,
  Signal,
} from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import {
  ButtonSize,
  ButtonVariant,
} from '../components/ui/button/button.types';
import { FormActions } from '@shared/components/form-actions/form-actions';

export class FormActionsOptions {
  submitLabel: string = 'Guardar';
  submitButtonVariant: ButtonVariant = 'primary';
  submitButtonSize: ButtonSize = 'sm';
  clearOnSubmit: boolean = false;
  canCancel: boolean = true;
  cancelLabel: string = 'Cancelar';
  cancelButtonVariant: ButtonVariant = 'outline';
  cancelButtonSize: ButtonSize = 'sm';
  canClear: boolean = false;
  clearLabel: string = 'Limpiar formulario';
  clearButtonVariant: ButtonVariant = 'outline';
  clearButtonSize: ButtonSize = 'sm';

  constructor(init?: Partial<FormActionsOptions>) {
    Object.assign(this, init);
  }
}

export type ExtractValue<T> = {
  [K in keyof T]: T[K] extends AbstractControl<infer V> ? V : never;
};

export interface FormEvent<T> {
  data?: T;
  changes?: Partial<T>;
  hasChanges: boolean;
}

export type FormSchema = Record<string, AbstractControl<any>>;

export abstract class FormComponent<TSchema extends FormSchema> {
  readonly defaultActions = new FormActionsOptions();
  abstract initialData: InputSignal<ExtractValue<TSchema>>;
  abstract actions: InputSignal<FormActionsOptions>;
  abstract submitted: OutputEmitterRef<FormEvent<ExtractValue<TSchema>>>;
  abstract canceled: OutputEmitterRef<FormEvent<ExtractValue<TSchema>>>;
  abstract formGroup: FormGroup<TSchema>;

  protected formActions: Signal<FormActions | undefined> = signal(undefined);

  readonly hasChanges = signal(false);
  private isValidForm = signal(false);
  private initialDataSnapshot = signal<ExtractValue<TSchema> | null>(null);
  protected canSubmit = computed(() => this.isValidForm() && this.hasChanges());

  constructor() {
    this.watchInitialData();
    this.watchFormActions();
    this.watchFormState();
  }

  // -- Setup ----------------------------------------------------------------

  private watchInitialData(): void {
    effect(() => {
      const data = this.initialData();
      this.initialDataSnapshot.set(structuredClone(data));
      this.formGroup.reset(data, { emitEvent: false });
      this.hasChanges.set(false);
    });
  }

  private watchFormActions(): void {
    effect((onCleanup) => {
      const fa = this.formActions();
      if (!fa) return;

      const cancelSub = fa.cancel.subscribe(() => this.onCancel());
      const clearSub = fa.clear.subscribe(() => this.onClear());

      onCleanup(() => {
        cancelSub.unsubscribe();
        clearSub.unsubscribe();
      });
    });
  }

  private watchFormState(): void {
    afterNextRender(() => {
      this.formGroup.valueChanges.subscribe((values) => {
        this.hasChanges.set(
          this.validateChanges(
            values as ExtractValue<TSchema>,
            this.initialDataSnapshot()!,
          ),
        );
      });

      this.formGroup.statusChanges.subscribe((status) => {
        this.isValidForm.set(status === 'VALID');
      });
    });
  }

  // -- Form actions ---------------------------------------------------------

  private onCancel(): void {
    this.canceled.emit({
      data: this.formGroup.getRawValue() as ExtractValue<TSchema>,
      changes: this.getChangedFields(),
      hasChanges: this.hasChanges(),
    });
    this.resetToInitial();
  }

  private onClear(): void {
    this.formGroup.reset({}, { emitEvent: false });
    this.hasChanges.set(true);
  }

  submit(): void {
    this.submitted.emit({
      data: this.formGroup.getRawValue() as ExtractValue<TSchema>,
      changes: this.getChangedFields(),
      hasChanges: this.hasChanges(),
    });
    if (this.actions().clearOnSubmit) {
      this.resetToInitial();
    }
  }

  // -- Helpers --------------------------------------------------------------

  private resetToInitial(): void {
    this.formGroup.reset(this.initialDataSnapshot()!, { emitEvent: false });
    this.hasChanges.set(false);
  }

  protected validateChanges(
    currentValue: ExtractValue<TSchema>,
    initialValue: ExtractValue<TSchema>,
  ): boolean {
    return Object.keys(currentValue).some((key) => {
      const control = this.formGroup.get(key);
      if (!control) return false;

      const c = currentValue[key];
      const i = initialValue[key];

      const changed = this.valuesChanged(c, i);

      changed
        ? control.markAsDirty({ onlySelf: false })
        : control.markAsPristine({ onlySelf: false });

      return changed;
    });
  }

  private valuesChanged(current: unknown, initial: unknown): boolean {
    if (Array.isArray(current) && Array.isArray(initial)) {
      if (current.length !== initial.length) return true;

      // Normalizar por JSON ordenado por clave para ignorar el orden del array
      const normalize = (arr: unknown[]) =>
        [...arr]
          .map((item) =>
            JSON.stringify(item, Object.keys(item as object).sort()),
          )
          .sort();

      const a = normalize(current);
      const b = normalize(initial);

      return a.some((item, idx) => item !== b[idx]);
    }

    return JSON.stringify(current) !== JSON.stringify(initial);
  }

  private getChangedFields(): Partial<ExtractValue<TSchema>> {
    const current = this.formGroup.getRawValue() as ExtractValue<TSchema>;
    const initial = this.initialDataSnapshot()!;

    return Object.keys(current).reduce(
      (changes, key) => {
        if (JSON.stringify(current[key]) !== JSON.stringify(initial[key])) {
          changes[key as keyof ExtractValue<TSchema>] = current[key];
        }
        return changes;
      },
      {} as Partial<ExtractValue<TSchema>>,
    );
  }
}
