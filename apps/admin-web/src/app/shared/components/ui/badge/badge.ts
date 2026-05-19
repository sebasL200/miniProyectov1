import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { buildBadgeClasses } from './badge.styles';
import { BadgeSize, BadgeVariant } from './badge.types';

@Component({
  selector: 'ecom-badge',
  imports: [],
  templateUrl: './badge.html',
  styleUrl: './badge.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'hostClasses()',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant()',
  },
})
export class Badge {
  readonly className = input('', { alias: 'class' });
  readonly size = input<BadgeSize>('md');
  readonly variant = input<BadgeVariant>('default');

  readonly hostClasses = computed(() =>
    buildBadgeClasses({
      className: this.className(),
      size: this.size(),
      variant: this.variant(),
    }),
  );
}
