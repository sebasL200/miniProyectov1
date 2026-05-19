import { ChangeDetectionStrategy, Component, computed, input, OnChanges, signal, SimpleChanges } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';
import {
  buildImageErrorSlotClasses,
  buildImageClasses,
  buildImagePlaceholderClasses,
  buildImagePlaceholderIconClasses,
} from './image.styles';
import { ImageSize } from './image.types';

@Component({
  selector: 'ecom-image',
  imports: [FaIconComponent],
  templateUrl: './image.html',
  styleUrl: './image.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Image implements OnChanges {
  readonly faImage = faImage;
  readonly className = input('', { alias: 'class' });
  readonly size = input<ImageSize>('md');
  readonly loading = input<'lazy' | 'eager'>('lazy');
  readonly src = input('');
  readonly alt = input('');

  readonly error = signal(false);
  readonly imageClasses = computed(() =>
    buildImageClasses({
      className: this.className(),
      size: this.size(),
    }),
  );
  readonly placeholderClasses = computed(() =>
    buildImagePlaceholderClasses({
      className: this.className(),
      size: this.size(),
    }),
  );
  readonly errorSlotClasses = computed(() =>
    buildImageErrorSlotClasses({
      className: this.className(),
      size: this.size(),
    }),
  );
  readonly placeholderIconClasses = computed(() => buildImagePlaceholderIconClasses(this.size()));

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['src']) {
      this.error.set(false);
    }
  }

  showError(): void {
    this.error.set(true);
  }
}
