import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { buildToolbarButtonClasses } from './toolbar-button.styles';

@Component({
  selector: 'ecom-toolbar-button',
  imports: [],
  templateUrl: './toolbar-button.html',
  styleUrl: './toolbar-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarButton {
  readonly className = input('', { alias: 'class' });
  readonly label = input.required<string>();
  readonly title = input('');
  readonly ariaLabel = input('');
  readonly pressed = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly triggered = output<void>();

  protected readonly buttonClasses = computed(() =>
    buildToolbarButtonClasses({
      className: this.className(),
      pressed: this.pressed(),
    }),
  );

  protected onMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }

  protected onClick(): void {
    if (this.disabled()) {
      return;
    }

    this.triggered.emit();
  }
}
