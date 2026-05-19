import { twMerge } from 'tailwind-merge';
import { TooltipSide } from './tooltip.types';

type TooltipTriggerClassOptions = {
  className?: string;
  disabled: boolean;
};

type TooltipContentClassOptions = {
  className?: string;
  open: boolean;
  side: TooltipSide;
};

const TOOLTIP_TRIGGER_BASE_CLASSES = ['relative', 'inline-flex', 'w-fit', 'max-w-full'].join(' ');

const TOOLTIP_CONTENT_BASE_CLASSES = [
  'pointer-events-none',
  'absolute',
  'z-50',
  'w-max',
  'max-w-72',
  'rounded-md',
  'bg-foreground',
  'px-3',
  'py-1.5',
  'text-xs',
  'text-background',
  'shadow-md',
  'transition-all',
  'duration-150',
].join(' ');

const TOOLTIP_SIDE_POSITION_CLASSES: Record<TooltipSide, string> = {
  top: 'bottom-full left-1/2 mb-2 -translate-x-1/2 origin-bottom',
  right: 'left-full top-1/2 ml-2 -translate-y-1/2 origin-left',
  bottom: 'top-full left-1/2 mt-2 -translate-x-1/2 origin-top',
  left: 'right-full top-1/2 mr-2 -translate-y-1/2 origin-right',
};

const TOOLTIP_ARROW_BASE_CLASSES = ['absolute', 'size-2.5', 'rotate-45', 'bg-foreground'].join(' ');

const TOOLTIP_ARROW_SIDE_CLASSES: Record<TooltipSide, string> = {
  top: 'left-1/2 top-full -translate-x-1/2 -translate-y-1/2',
  right: 'right-full top-1/2 translate-x-1/2 -translate-y-1/2',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2',
  left: 'left-full top-1/2 -translate-x-1/2 -translate-y-1/2',
};

export function buildTooltipTriggerClasses({
  className,
  disabled,
}: TooltipTriggerClassOptions): string {
  return twMerge(TOOLTIP_TRIGGER_BASE_CLASSES, disabled && 'cursor-default', className);
}

export function buildTooltipContentClasses({
  className,
  open,
  side,
}: TooltipContentClassOptions): string {
  return twMerge(
    TOOLTIP_CONTENT_BASE_CLASSES,
    TOOLTIP_SIDE_POSITION_CLASSES[side],
    open ? 'visible opacity-100 scale-100' : 'invisible opacity-0 scale-95',
    className,
  );
}

export function buildTooltipArrowClasses(side: TooltipSide): string {
  return twMerge(TOOLTIP_ARROW_BASE_CLASSES, TOOLTIP_ARROW_SIDE_CLASSES[side]);
}
