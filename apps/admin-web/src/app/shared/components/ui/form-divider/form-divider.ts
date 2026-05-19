import { Component, computed, input } from '@angular/core';
import { LabelPosition } from './form-divider.types';
import { buildFormDividerClasses } from './form-divider.styles';

@Component({
  selector: 'ecom-form-divider',
  imports: [],
  templateUrl: './form-divider.html',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class FormDivider {
  className = input<string | undefined>(undefined, { alias: 'class' });
  labelPosition = input<LabelPosition>('left');
  label = input<string | undefined>();

  protected hostClasses = computed(() =>
    buildFormDividerClasses({
      className: this.className(),
      labelPosition: this.labelPosition(),
    }),
  );
}
