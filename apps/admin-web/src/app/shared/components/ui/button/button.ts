import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { buildButtonClasses } from './button.styles';
import { ButtonSize, ButtonType, ButtonVariant } from './button.types';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'ecom-button',
  imports: [RouterLink, NgTemplateOutlet],
  templateUrl: './button.html',
  styleUrl: './button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(click)': 'handleClick($event)',
  },
})
export class Button {
  title = input('button');
  className = input('', { alias: 'class' });
  size = input<ButtonSize>('md');
  variant = input<ButtonVariant>('primary');
  type = input<ButtonType>('button');
  routerLink = input<string>('');
  href = input<string>('');
  target = input<HTMLAnchorElement['target']>('_self');
  disabled = input<boolean>(false);
  clicked = output<MouseEvent>();

  hostClasses = computed(() =>
    buildButtonClasses({
      className: this.className(),
      size: this.size(),
      variant: this.variant(),
    }),
  );

  handleClick(event: Event): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.clicked.emit(event as MouseEvent);
  }

  stopIfDisabled(event: Event): void {
    if (this.disabled()) {
      event.stopPropagation();
      event.preventDefault();
    }
  }
}
