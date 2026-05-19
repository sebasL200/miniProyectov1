import { FormActionsOptions } from '@shared/interfaces/form.interface';
import { Component, effect, input, output } from '@angular/core';
import { Button } from '../ui';

@Component({
    selector: 'ecom-form-actions',
    imports: [Button],
    templateUrl: './form-actions.html',
    styleUrl: './form-actions.css',
})
export class FormActions {
    disableSubmit = input<boolean>(false);

    clear = output<void>();
    cancel = output<void>();
    submit = output<void>();
    actions = input.required<FormActionsOptions>();

    constructor(){
      effect(() => {
        console.log('FormActions - disableSubmit changed:', this.disableSubmit());
      })
    }
}
