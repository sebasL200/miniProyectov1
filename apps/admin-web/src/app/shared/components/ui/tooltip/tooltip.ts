import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  ContentChildren,
  DestroyRef,
  inject,
  input,
  numberAttribute,
  QueryList,
  signal,
} from '@angular/core';
import { Slot } from '../../../directives/slot/slot';
import {
  buildTooltipArrowClasses,
  buildTooltipContentClasses,
  buildTooltipTriggerClasses,
} from './tooltip.styles';
import { TooltipSide } from './tooltip.types';

@Component({
  selector: 'ecom-tooltip',
  imports: [],
  templateUrl: './tooltip.html',
  styleUrl: './tooltip.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'contents',
  },
})
export class Tooltip {
  @ContentChildren(Slot) slots!: QueryList<Slot>;

  readonly className = input('', { alias: 'class' });
  readonly contentClass = input('');
  readonly content = input('');
  readonly side = input<TooltipSide>('top');
  readonly delayDuration = input(0, { transform: numberAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly destroyRef = inject(DestroyRef);
  private openTimerId: ReturnType<typeof setTimeout> | null = null;

  protected readonly open = signal(false);
  protected readonly triggerClasses = computed(() =>
    buildTooltipTriggerClasses({
      className: this.className(),
      disabled: this.disabled(),
    }),
  );
  protected readonly contentClasses = computed(() =>
    buildTooltipContentClasses({
      className: this.contentClass(),
      open: this.open(),
      side: this.side(),
    }),
  );
  protected readonly arrowClasses = computed(() => buildTooltipArrowClasses(this.side()));

  constructor() {
    this.destroyRef.onDestroy(() => this.clearOpenTimer());
  }

  protected hasSlot(name: string): boolean {
    return this.slots?.some((slot) => slot.slot() === name) ?? false;
  }

  protected hasContent(): boolean {
    return this.hasSlot('content') || this.content().trim().length > 0;
  }

  protected onPointerEnter(): void {
    if (this.disabled() || !this.hasContent()) {
      return;
    }

    this.clearOpenTimer();

    if (this.delayDuration() <= 0) {
      this.open.set(true);
      return;
    }

    this.openTimerId = setTimeout(() => {
      this.openTimerId = null;
      this.open.set(true);
    }, this.delayDuration());
  }

  protected onPointerLeave(): void {
    this.closeTooltip();
  }

  protected onFocusIn(): void {
    this.onPointerEnter();
  }

  protected onFocusOut(event: FocusEvent): void {
    const currentTarget = event.currentTarget as HTMLElement | null;
    const relatedTarget = event.relatedTarget as Node | null;

    if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) {
      return;
    }

    this.closeTooltip();
  }

  protected onEscapeKey(): void {
    this.closeTooltip();
  }

  private closeTooltip(): void {
    this.clearOpenTimer();
    this.open.set(false);
  }

  private clearOpenTimer(): void {
    if (this.openTimerId !== null) {
      clearTimeout(this.openTimerId);
      this.openTimerId = null;
    }
  }
}
