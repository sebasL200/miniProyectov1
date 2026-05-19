import { twMerge } from 'tailwind-merge';
import { SwitchSize, SwitchVariant } from './switch.types';

type SwitchWrapperClassOptions = {
  className?: string;
  disabled?: boolean;
  readonly?: boolean;
};

type SwitchTrackClassOptions = {
  size: SwitchSize;
  variant: SwitchVariant;
  readonly?: boolean;
};

type SwitchThumbClassOptions = {
  size: SwitchSize;
  checked: boolean;
};

type SwitchLabelClassOptions = {
  size: SwitchSize;
};

const SWITCH_WRAPPER_BASE_CLASSES = [
  'group',
  'relative',
  'inline-flex',
  'w-fit',
  'items-center',
  'gap-2',
  'align-middle',
  'select-none',
].join(' ');

export function buildSwitchWrapperClasses({
  className,
  disabled,
  readonly,
}: SwitchWrapperClassOptions = {}): string {
  return twMerge(
    SWITCH_WRAPPER_BASE_CLASSES,
    disabled ? 'cursor-not-allowed' : readonly ? 'cursor-default' : 'cursor-pointer',
    className,
  );
}

const SWITCH_INPUT_CLASSES = [
  'peer',
  'absolute',
  'inset-0',
  'm-0',
  'h-full',
  'w-full',
  'cursor-inherit',
  'appearance-none',
  'opacity-0',
].join(' ');

export function buildSwitchInputClasses(): string {
  return SWITCH_INPUT_CLASSES;
}

const SWITCH_TRACK_BASE_CLASSES = [
  'relative',
  'inline-flex',
  'shrink-0',
  'overflow-hidden',
  'rounded-full',
  'border',
  'transition-[background-color,border-color,box-shadow]',
  'duration-200',
  'ease-out',
  'peer-focus-visible:ring-2',
  'peer-focus-visible:ring-ring',
  'peer-focus-visible:ring-offset-2',
  'peer-focus-visible:ring-offset-background',
  'peer-disabled:cursor-not-allowed',
  'peer-disabled:opacity-50',
  'border-border',
  'bg-muted/70',
].join(' ');

const SWITCH_TRACK_SIZE_CLASSES: Record<SwitchSize, string> = {
  sm: 'h-5 w-9',
  md: 'h-6 w-11',
  lg: 'h-7 w-[3.25rem]',
};

const SWITCH_TRACK_VARIANT_CLASSES: Record<SwitchVariant, string> = {
  primary: [
    'peer-checked:border-primary',
    'peer-checked:bg-primary',
  ].join(' '),
  secondary: [
    'peer-checked:border-secondary',
    'peer-checked:bg-secondary',
  ].join(' '),
  tertiary: [
    'peer-checked:border-accent',
    'peer-checked:bg-accent',
  ].join(' '),
  ghost: [
    'bg-transparent',
    'hover:bg-accent/20',
    'peer-checked:border-accent',
    'peer-checked:bg-accent',
  ].join(' '),
  outline: [
    'border-border',
    'bg-background',
    'hover:bg-accent/20',
    'peer-checked:border-border',
    'peer-checked:bg-accent/80',
  ].join(' '),
  danger: [
    'border-destructive/40',
    'bg-muted/70',
    'hover:border-destructive/80',
    'peer-checked:border-destructive',
    'peer-checked:bg-destructive',
  ].join(' '),
};

export function buildSwitchTrackClasses({
  size,
  variant,
  readonly,
}: SwitchTrackClassOptions): string {
  return twMerge(
    SWITCH_TRACK_BASE_CLASSES,
    SWITCH_TRACK_SIZE_CLASSES[size],
    SWITCH_TRACK_VARIANT_CLASSES[variant],
    readonly && 'hover:border-inherit hover:bg-inherit',
  );
}

const SWITCH_THUMB_BASE_CLASSES = [
  'pointer-events-none',
  'absolute',
  'left-0.5',
  'top-1/2',
  'block',
  '-translate-y-1/2',
  'rounded-full',
  'bg-white',
  'shadow-sm',
  'transform-gpu',
  'transition-transform',
  'duration-200',
  'ease-out',
  'will-change-transform',
].join(' ');

const SWITCH_THUMB_SIZE_CLASSES: Record<SwitchSize, { base: string; checked: string }> = {
  sm: {
    base: 'size-4',
    checked: 'translate-x-4',
  },
  md: {
    base: 'size-5',
    checked: 'translate-x-5',
  },
  lg: {
    base: 'size-6',
    checked: 'translate-x-6',
  },
};

export function buildSwitchThumbClasses({ size, checked }: SwitchThumbClassOptions): string {
  return twMerge(
    SWITCH_THUMB_BASE_CLASSES,
    SWITCH_THUMB_SIZE_CLASSES[size].base,
    checked && SWITCH_THUMB_SIZE_CLASSES[size].checked,
  );
}

const SWITCH_LABEL_BASE_CLASSES = [
  'font-medium',
  'leading-none',
  'text-foreground',
  'peer-disabled:cursor-not-allowed',
  'peer-disabled:opacity-50',
].join(' ');

const SWITCH_LABEL_SIZE_CLASSES: Record<SwitchSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function buildSwitchLabelClasses({ size }: SwitchLabelClassOptions): string {
  return twMerge(SWITCH_LABEL_BASE_CLASSES, SWITCH_LABEL_SIZE_CLASSES[size]);
}
