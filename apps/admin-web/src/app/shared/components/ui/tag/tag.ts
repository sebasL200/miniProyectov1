import { Component, computed, input } from '@angular/core';
import { buildTagRootClasses } from './tag.styles';
import { TagSize, TagVariant } from './tag.types';

@Component({
  selector: 'ecom-tag',
  imports: [],
  templateUrl: './tag.html',
  styleUrl: './tag.css',
  host: {
    '[class]': 'hostClasses()',
  }
})
export class Tag {
  className = input<string | undefined>('', { alias: 'class' });
  size = input<TagSize>('md');
  variant = input<TagVariant>('primary');

  hostClasses = computed<string>(() =>
    buildTagRootClasses({
      className: this.className(),
      size: this.size(),
      variant: this.variant(),
    }),
  );
}
