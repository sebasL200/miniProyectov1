import { AbstractControl, ValidationErrors } from '@angular/forms';

export function urlValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value || value === '') return null; // campo opcional

    try {
        const parsed = new URL(value);
        const isValid = parsed.protocol === 'https:' || parsed.protocol === 'http:';
        return isValid ? null : { invalidUrl: true };
    } catch {
        return { invalidUrl: true };
    }
}
