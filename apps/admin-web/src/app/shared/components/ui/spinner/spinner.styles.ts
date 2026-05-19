import { twMerge } from 'tailwind-merge';
import { SpinnerSize, SpinnerVariant } from './spinner.types';

type SpinnerRootClassOptions = {
  className?: string;
};

type SpinnerIconClassOptions = {
  size: SpinnerSize;
  variant: SpinnerVariant;
};

const SPINNER_ROOT_CLASSES = ['inline-flex', 'w-fit', 'items-center', 'justify-center'].join(' ');

const SPINNER_ICON_SIZE_CLASSES: Record<SpinnerSize, string> = {
  xs: 'size-3',
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
  xl: 'size-8',
};

const SPINNER_ICON_VARIANT_CLASSES: Record<SpinnerVariant, string> = {
  default: 'text-primary',
  secondary: 'text-secondary',
  destructive: 'text-destructive',
  outline: 'text-foreground',
  ghost: 'text-foreground',
  link: 'text-primary',
};

export function buildSpinnerRootClasses({ className }: SpinnerRootClassOptions): string {
  return twMerge(SPINNER_ROOT_CLASSES, className);
}

export function buildSpinnerIconClasses({ size, variant }: SpinnerIconClassOptions): string {
  return twMerge(
    'animate-spin origin-center',
    SPINNER_ICON_SIZE_CLASSES[size],
    SPINNER_ICON_VARIANT_CLASSES[variant],
  );
}
