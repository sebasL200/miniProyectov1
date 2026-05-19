import { AbstractControl, NgControl } from '@angular/forms';

export type FormErrorMessages = Partial<Record<string, string | null>>;

export type FormErrorMessageControl = AbstractControl | NgControl | null | undefined;
