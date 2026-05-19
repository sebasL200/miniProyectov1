import { twMerge } from 'tailwind-merge';

type ToolbarButtonClassOptions = {
  className?: string;
  pressed: boolean;
};

const TOOLBAR_BUTTON_BASE_CLASSES = [
  'inline-flex',
  'h-8',
  'min-w-8',
  'items-center',
  'justify-center',
  'rounded-sm',
  'border',
  'border-transparent',
  'px-2',
  'text-sm',
  'font-medium',
  'text-muted-foreground',
  'transition-colors',
  'duration-150',
  'outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background',
  'disabled:cursor-not-allowed',
  'disabled:opacity-50',
].join(' ');

export function buildToolbarButtonClasses({
  className,
  pressed,
}: ToolbarButtonClassOptions): string {
  return twMerge(
    TOOLBAR_BUTTON_BASE_CLASSES,
    pressed
      ? 'border-border bg-accent text-accent-foreground'
      : 'bg-transparent hover:bg-accent/70 hover:text-foreground',
    className,
  );
}
