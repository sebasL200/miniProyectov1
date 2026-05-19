import { twMerge } from 'tailwind-merge';
import { InputSelectDirection, InputSelectSize } from './input-select.types';

type InputSelectContainerClassOptions = {
  className?: string;
};

type InputSelectTriggerClassOptions = {
  size: InputSelectSize;
  invalid: boolean;
  disabled: boolean;
  readonly: boolean;
  open: boolean;
};

type InputSelectDropdownClassOptions = {
  open: boolean;
  direction: InputSelectDirection;
};

type InputSelectOptionClassOptions = {
  size: InputSelectSize;
  selected: boolean;
  disabled: boolean;
};

const INPUT_SELECT_CONTAINER_BASE_CLASSES = ['relative', 'block', 'max-w-full'].join(' ');

export function buildInputSelectContainerClasses({
  className,
}: InputSelectContainerClassOptions): string {
  return twMerge(INPUT_SELECT_CONTAINER_BASE_CLASSES, className);
}

const INPUT_SELECT_TRIGGER_BASE_CLASSES = [
  'inline-flex',
  'w-full',
  'items-center',
  'justify-between',
  'gap-2',
  'rounded-sm',
  'border',
  'border-border',
  'bg-background',
  'text-foreground',
  'shadow-sm',
  'transition-[border-color,box-shadow,background-color]',
  'duration-200',
  'outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background',
].join(' ');

const INPUT_SELECT_TRIGGER_SIZE_CLASSES: Record<InputSelectSize, string> = {
  xs: 'h-7 px-2.5 text-xs',
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-11 px-5 text-lg',
  xl: 'h-12 px-6 text-xl',
};

export function buildInputSelectTriggerClasses({
  size,
  invalid,
  disabled,
  readonly,
  open,
}: InputSelectTriggerClassOptions): string {
  return twMerge(
    INPUT_SELECT_TRIGGER_BASE_CLASSES,
    INPUT_SELECT_TRIGGER_SIZE_CLASSES[size],
    invalid && 'border-destructive focus-visible:ring-destructive/20',
    open && 'border-ring ring-2 ring-ring/10',
    disabled && 'cursor-not-allowed opacity-50',
    !disabled && readonly && 'cursor-default',
    !disabled && !readonly && 'cursor-pointer',
  );
}

export const INPUT_SELECT_LABEL_CLASSES = ['min-w-0', 'flex-1', 'truncate', 'text-left'].join(' ');

export function buildInputSelectIconClasses({ open }: { open: boolean }): string {
  return twMerge(
    'shrink-0 text-muted-foreground transition-transform duration-200',
    open && 'rotate-180',
  );
}

const INPUT_SELECT_DROPDOWN_BASE_CLASSES = [
  'absolute',
  'left-0',
  'z-20',
  'w-full',
  'overflow-hidden',
  'rounded-sm',
  'border',
  'border-border',
  'bg-background',
  'shadow-lg',
  'transition-all',
  'duration-200',
].join(' ');

export function buildInputSelectDropdownClasses({
  open,
  direction,
}: InputSelectDropdownClassOptions): string {
  return twMerge(
    INPUT_SELECT_DROPDOWN_BASE_CLASSES,
    direction === 'up' ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top',
    open
      ? 'pointer-events-auto h-auto opacity-100 scale-y-100'
      : 'pointer-events-none h-0 opacity-0 scale-y-95',
  );
}

export const INPUT_SELECT_SEARCH_WRAPPER_CLASSES = ['border-b', 'border-border', 'p-2'].join(' ');

const INPUT_SELECT_SEARCH_INPUT_BASE_CLASSES = [
  'block',
  'w-full',
  'rounded-sm',
  'border',
  'border-border',
  'bg-background',
  'text-foreground',
  'shadow-sm',
  'transition-colors',
  'duration-200',
  'outline-none',
  'placeholder:text-muted-foreground',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background',
].join(' ');

const INPUT_SELECT_SEARCH_INPUT_SIZE_CLASSES: Record<InputSelectSize, string> = {
  xs: 'h-7 px-2.5 text-xs',
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-11 px-5 text-lg',
  xl: 'h-12 px-6 text-xl',
};

export function buildInputSelectSearchInputClasses(size: InputSelectSize): string {
  return twMerge(
    INPUT_SELECT_SEARCH_INPUT_BASE_CLASSES,
    INPUT_SELECT_SEARCH_INPUT_SIZE_CLASSES[size],
  );
}

export const INPUT_SELECT_OPTIONS_WRAPPER_CLASSES = ['max-h-60', 'overflow-y-auto', 'p-1', 'space-y-1'].join(
  ' ',
);

const INPUT_SELECT_OPTION_BASE_CLASSES = [
  'flex',
  'w-full',
  'items-center',
  'rounded-sm',
  'text-left',
  'text-foreground',
  'transition-colors',
  'duration-150',
  'outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background',
].join(' ');

const INPUT_SELECT_OPTION_SIZE_CLASSES: Record<InputSelectSize, string> = {
  xs: 'min-h-7 px-2.5 text-xs',
  sm: 'min-h-8 px-3 text-sm',
  md: 'min-h-10 px-4 text-base',
  lg: 'min-h-11 px-5 text-lg',
  xl: 'min-h-12 px-6 text-xl',
};

export function buildInputSelectOptionClasses({
  size,
  selected,
  disabled,
}: InputSelectOptionClassOptions): string {
  return twMerge(
    INPUT_SELECT_OPTION_BASE_CLASSES,
    INPUT_SELECT_OPTION_SIZE_CLASSES[size],
    selected && 'bg-accent text-accent-foreground',
    !selected && 'bg-transparent',
    disabled && 'cursor-not-allowed opacity-50',
    !disabled && 'cursor-pointer hover:bg-accent hover:text-accent-foreground',
  );
}

export const INPUT_SELECT_EMPTY_STATE_CLASSES = [
  'px-3',
  'py-2',
  'text-sm',
  'text-muted-foreground',
].join(' ');
