import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { AbstractControl, NgControl, ValidationErrors } from '@angular/forms';
import {
  buildFormErrorMessageRootClasses,
  buildFormErrorMessageTextClasses,
} from './form-error-message.styles';
import { FormErrorMessageControl, FormErrorMessages } from './form-error-message.types';

@Component({
  selector: 'ecom-form-error-message',
  imports: [],
  templateUrl: './form-error-message.html',
  styleUrl: './form-error-message.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'rootClasses()',
  },
})
export class FormErrorMessage {
  readonly className = input('', { alias: 'class' });
  readonly control = input<FormErrorMessageControl>(null);
  readonly messages = input<FormErrorMessages>({});

  private readonly controlEventsVersion = signal(0);
  private readonly resolvedControl = computed(() => resolveAbstractControl(this.control()));

  readonly rootClasses = computed(() =>
    buildFormErrorMessageRootClasses({ className: this.className() }),
  );
  readonly textClasses = computed(() => buildFormErrorMessageTextClasses());
  readonly shouldShow = computed(() => {
    const control = this.resolvedControl();

    this.controlEventsVersion();

    return !!control && control.invalid && (control.touched || control.dirty);
  });
  readonly message = computed(() => {
    const control = this.resolvedControl();

    this.controlEventsVersion();

    if (!control?.errors || !this.shouldShow()) {
      return null;
    }

    return buildFirstErrorMessage(control.errors, this.messages());
  });

  constructor() {
    effect((onCleanup) => {
      const control = this.resolvedControl();

      if (!control) {
        return;
      }

      const subscription = control.events.subscribe(() => {
        this.controlEventsVersion.update((version) => version + 1);
      });

      onCleanup(() => subscription.unsubscribe());
    });
  }
}

function resolveAbstractControl(control: FormErrorMessageControl): AbstractControl | null {
  if (!control) {
    return null;
  }

  return control instanceof NgControl ? control.control : control;
}

function buildFirstErrorMessage(
  errors: ValidationErrors,
  messages: FormErrorMessages,
): string | null {
  const [errorKey] = Object.keys(errors);

  if (!errorKey) {
    return null;
  }

  if (errorKey in messages) {
    return messages[errorKey] ?? null;
  }

  const errorValue = errors[errorKey];

  switch (errorKey) {
    case 'required':
      return 'Este campo es obligatorio.';
    case 'email':
      return 'Ingresa un correo electrónico válido.';
    case 'minlength': {
      const requiredLength = getNumericProperty(errorValue, 'requiredLength');
      return requiredLength === null
        ? 'El valor ingresado es demasiado corto.'
        : `Debe tener al menos ${requiredLength} caracteres.`;
    }
    case 'maxlength': {
      const requiredLength = getNumericProperty(errorValue, 'requiredLength');
      return requiredLength === null
        ? 'El valor ingresado excede la longitud permitida.'
        : `No puede exceder ${requiredLength} caracteres.`;
    }
    case 'min': {
      const minValue = getNumericProperty(errorValue, 'min');
      return minValue === null
        ? 'El valor ingresado es menor al permitido.'
        : `Debe ser mayor o igual a ${minValue}.`;
    }
    case 'max': {
      const maxValue = getNumericProperty(errorValue, 'max');
      return maxValue === null
        ? 'El valor ingresado es mayor al permitido.'
        : `Debe ser menor o igual a ${maxValue}.`;
    }
    case 'pattern':
      return 'El formato ingresado no es válido.';
    default:
      return 'El valor ingresado no es válido.';
  }
}

function getNumericProperty(value: unknown, key: string): number | null {
  if (
    typeof value !== 'object' ||
    value === null ||
    !(key in value) ||
    typeof (value as Record<string, unknown>)[key] !== 'number'
  ) {
    return null;
  }

  return (value as Record<string, number>)[key];
}
