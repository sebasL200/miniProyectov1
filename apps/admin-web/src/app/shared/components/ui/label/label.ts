import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl, Validators } from '@angular/forms';
import { startWith } from 'rxjs';
import { LabelSize } from './label.types';
import {
  buildLabelContentClasses,
  buildLabelHeaderClasses,
  buildLabelRequiredClasses,
  buildLabelRootClasses,
  buildLabelTextClasses,
} from './label.styles';

@Component({
  selector: 'ecom-label',
  imports: [],
  templateUrl: './label.html',
  styleUrl: './label.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'rootClasses()',
  },
})
export class Label {
  private readonly destroyRef = inject(DestroyRef);

  forId = input('', { alias: 'for' });
  className = input('', { alias: 'class' });
  label = input.required<string>();
  size = input<LabelSize>('md');
  required = input(false, { transform: booleanAttribute });

  control = contentChild(NgControl);

  private readonly controlHasRequired = signal(false);

  constructor() {
    effect((onCleanup) => {
      const abstractControl = this.control()?.control;

      if (!abstractControl) {
        this.controlHasRequired.set(false);
        return;
      }

      if (!abstractControl.statusChanges) {
        this.controlHasRequired.set(abstractControl.hasValidator(Validators.required));
        return;
      }

      const subscription = abstractControl.statusChanges
        .pipe(startWith(null), takeUntilDestroyed(this.destroyRef))
        .subscribe(() => {
          this.controlHasRequired.set(abstractControl.hasValidator(Validators.required));
        });

      onCleanup(() => subscription.unsubscribe());
    });
  }

  readonly rootClasses = computed(() => buildLabelRootClasses({ className: this.className() }));
  readonly headerClasses = computed(() => buildLabelHeaderClasses());
  readonly labelClasses = computed(() => buildLabelTextClasses({ size: this.size() }));
  readonly requiredClasses = computed(() => buildLabelRequiredClasses());
  readonly contentClasses = computed(() => buildLabelContentClasses());

  readonly isRequired = computed(() => this.required() || this.controlHasRequired());
}
