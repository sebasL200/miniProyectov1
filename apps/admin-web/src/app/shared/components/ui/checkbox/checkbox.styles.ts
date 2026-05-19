import { CheckboxSize, CheckboxVariant } from './checkbox.types';
import { twMerge } from 'tailwind-merge';

// ─── Tipos compartidos ────────────────────────────────────────────────────────

type CheckboxClassOptions = {
  className?: string;
  variant: CheckboxVariant;
  size: CheckboxSize;
  disabled?: boolean;
};

type LabelClassOptions = {
  className?: string;
  size: CheckboxSize;
  disabled?: boolean;
};

type CheckboxWrapperClassOptions = {
  className?: string;
  disabled?: boolean;
  readonly?: boolean;
};

// ─── Wrapper (conjunto checkbox + label) ─────────────────────────────────────

const CHECKBOX_WRAPPER_BASE_CLASSES = ['inline-flex', 'items-center', 'gap-2', 'select-none'].join(
  ' ',
);

export function buildCheckboxWrapperClasses({
  className,
  disabled,
  readonly,
}: CheckboxWrapperClassOptions = {}): string {
  return twMerge(
    CHECKBOX_WRAPPER_BASE_CLASSES,
    disabled ? 'cursor-not-allowed opacity-50' : readonly ? 'cursor-default' : 'cursor-pointer',
    className,
  );
}

// ─── Checkbox ─────────────────────────────────────────────────────────────────

const CHECKBOX_BASE_CLASSES = [
  'appearance-none',
  'shrink-0',
  'rounded',
  'border',
  'cursor-pointer',
  'transition-colors',
  'duration-200',
  'outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background',
  // check mark via background-image al estar checked
  'checked:bg-no-repeat',
  'checked:bg-center',
  'checked:bg-[length:65%_65%]',
  "checked:bg-[url(\"data:image/svg+xml,%3Csvg viewBox='0 0 10 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 4l3 3 5-6' stroke='white' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")]",
  'disabled:cursor-not-allowed',
  'disabled:opacity-50',
].join(' ');

const CHECKBOX_SIZE_CLASSES: Record<CheckboxSize, string> = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
};

const CHECKBOX_VARIANT_CLASSES: Record<CheckboxVariant, string> = {
  primary: [
    'border-border',
    'hover:border-primary',
    'checked:bg-primary',
    'checked:border-primary',
    'hover:checked:bg-primary-hover',
    'hover:checked:border-primary-hover',
    'active:checked:bg-primary-pressed',
    'active:checked:border-primary-pressed',
  ].join(' '),
  secondary: [
    'bg-secondary-background',
    'border-secondary/15',
    'hover:border-secondary/30',
    'checked:bg-secondary',
    'checked:border-secondary',
    'hover:checked:bg-secondary-hover',
  ].join(' '),
  tertiary: [
    'border-border',
    'hover:border-accent',
    'checked:bg-accent',
    'checked:border-accent',
    'hover:checked:bg-muted',
  ].join(' '),
  ghost: [
    'bg-transparent',
    'border-transparent',
    'hover:bg-accent/30',
    'checked:bg-accent',
    'checked:border-accent',
  ].join(' '),
  outline: [
    'bg-background',
    'border-border',
    'hover:bg-accent/30',
    'checked:bg-accent',
    'checked:border-border',
  ].join(' '),
  danger: [
    'border-destructive/40',
    'hover:border-destructive',
    'checked:bg-destructive',
    'checked:border-destructive',
    'hover:checked:bg-destructive-hover',
    'hover:checked:border-destructive-hover',
    'active:checked:bg-destructive-pressed',
    'active:checked:border-destructive-pressed',
  ].join(' '),
};

export function buildCheckboxClasses({ className, size, variant }: CheckboxClassOptions): string {
  return twMerge(
    CHECKBOX_BASE_CLASSES,
    CHECKBOX_SIZE_CLASSES[size],
    CHECKBOX_VARIANT_CLASSES[variant],
    className,
  );
}

// ─── Label ────────────────────────────────────────────────────────────────────

const LABEL_BASE_CLASSES = [
  'font-medium',
  'leading-none',
  'cursor-pointer',
  'select-none',
  'text-foreground',
  'peer-disabled:cursor-not-allowed',
  'peer-disabled:opacity-50',
].join(' ');

const LABEL_SIZE_CLASSES: Record<CheckboxSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function buildCheckboxLabelClasses({ className, size }: LabelClassOptions): string {
  return twMerge(LABEL_BASE_CLASSES, LABEL_SIZE_CLASSES[size], className);
}
