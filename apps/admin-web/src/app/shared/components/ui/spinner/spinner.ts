import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons';
import { buildSpinnerIconClasses, buildSpinnerRootClasses } from './spinner.styles';
import { SpinnerSize, SpinnerVariant } from './spinner.types';

@Component({
  selector: 'ecom-spinner',
  imports: [FaIconComponent],
  templateUrl: './spinner.html',
  styleUrl: './spinner.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'rootClasses()',
    'role': 'status',
    '[attr.aria-label]': 'label()',
  },
})
export class Spinner {
  readonly className = input('', { alias: 'class' });
  readonly size = input<SpinnerSize>('sm');
  readonly variant = input<SpinnerVariant>('default');
  readonly label = input('Cargando');

  protected readonly spinnerIcon = faCircleNotch;
  protected readonly rootClasses = computed(() =>
    buildSpinnerRootClasses({
      className: this.className(),
    }),
  );
  protected readonly iconClasses = computed(() =>
    buildSpinnerIconClasses({
      size: this.size(),
      variant: this.variant(),
    }),
  );
}
