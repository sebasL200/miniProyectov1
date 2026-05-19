import { ButtonSize, ButtonVariant } from './button.types';
import { twMerge } from 'tailwind-merge';

type ButtonClassOptions = {
  className?: string;
  size: ButtonSize;
  variant: ButtonVariant;
};

const BUTTON_BASE_CLASSES = [
  'inline-flex',
  'w-fit',
  'items-center',
  'justify-center',
  'gap-2',
  'whitespace-nowrap',
  'rounded-sm',
  'border',
  'border-transparent',
  'font-medium',
  'leading-none',
  'select-none',
  'transition-colors',
  'duration-200',
  'cursor-pointer',
  'outline-none',
  'hover:cursor-pointer',
  'disabled:hover:cursor-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background',
  'disabled:pointer-events-none',
  'disabled:opacity-50',
].join(' ');

const BUTTON_SIZE_CLASSES: Record<ButtonSize, string> = {
  xs: 'h-7 px-2.5 text-xs',
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-11 px-5 text-lg',
  xl: 'h-12 px-6 text-xl',
  icon: 'h-10 w-10 p-0',
  'icon-sm': 'h-8 w-8 p-0',
  'icon-lg': 'h-11 w-11 p-0',
};

const BUTTON_VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: [
    'bg-primary',
    'text-primary-foreground',
    'border-primary',
    'shadow-sm',
    'hover:bg-primary-hover',
    'hover:border-primary-hover',
    'active:bg-primary-pressed',
    'active:border-primary-pressed',
  ].join(' '),
  secondary: [
    'bg-secondary',
    'text-secondary-foreground',
    'border-secondary/15',
    'hover:bg-secondary-hover',
    'active:bg-secondary-pressed',
  ].join(' '),
  tertiary: [
    'bg-tertiary',
    'text-tertiary-foreground',
    'hover:bg-tertiary-hover',
    'active:bg-tertiary-pressed',
  ].join(' '),
  ghost: [
    'bg-transparent',
    'text-foreground',
    'hover:bg-accent',
    'hover:text-accent-foreground',
    'active:bg-muted',
  ].join(' '),
  outline: [
    'bg-background',
    'text-foreground',
    'border-border',
    'hover:bg-accent',
    'hover:text-accent-foreground',
    'active:bg-muted',
  ].join(' '),
  danger: [
    'bg-destructive',
    'text-destructive-foreground',
    'border-destructive',
    'shadow-sm',
    'hover:bg-destructive-hover',
    'hover:border-destructive-hover',
    'active:bg-destructive-pressed',
    'active:border-destructive-pressed',
  ].join(' '),
  warning: [
    'bg-warning',
    'text-warning-foreground',
    'border-warning',
    'shadow-sm',
    'hover:bg-warning-hover',
    'hover:border-warning-hover',
    'active:bg-warning-pressed',
    'active:border-warning-pressed',
  ].join(' '),
  link: [
    'bg-transparent',
    'border-transparent',
    'text-primary',
    'shadow-none',
    'underline-offset-4',
    'hover:underline',
    'hover:text-primary-hover',
    'active:text-primary-pressed',
  ].join(' '),
  accent: [
    'bg-muted',
    'text-accent-foreground',
    'border-accent',
    'shadow-sm',
    'hover:bg-accent-hover',
    'hover:border-accent-hover',
    'active:bg-accent-pressed',
    'active:border-accent-pressed',
  ].join(' '),
};

export function buildButtonClasses({
  className,
  size,
  variant,
}: ButtonClassOptions): string {
  return twMerge(
    BUTTON_BASE_CLASSES,
    BUTTON_SIZE_CLASSES[size],
    BUTTON_VARIANT_CLASSES[variant],
    className,
  );
}
