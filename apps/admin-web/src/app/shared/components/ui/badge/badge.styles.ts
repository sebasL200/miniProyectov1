import { twMerge } from 'tailwind-merge';
import { BadgeSize, BadgeVariant } from './badge.types';

type BadgeClassOptions = {
  className?: string;
  size: BadgeSize;
  variant: BadgeVariant;
};

const BADGE_BASE_CLASSES = [
  'inline-flex',
  'w-fit',
  'shrink-0',
  'items-center',
  'justify-center',
  'gap-1',
  'overflow-hidden',
  'rounded-full',
  'border',
  'border-transparent',
  'font-medium',
  'leading-none',
  'whitespace-nowrap',
  'transition-colors',
  'duration-200',
  'select-none',
  'focus-visible:outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background',
  '[&>svg]:pointer-events-none',
].join(' ');

const BADGE_SIZE_CLASSES: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0 text-[10px] [&>svg]:size-2.5',
  sm: 'px-2 py-0.5 text-xs [&>svg]:size-3',
  md: 'px-2.5 py-0.5 text-xs [&>svg]:size-3',
  lg: 'px-3 py-1 text-sm [&>svg]:size-3.5',
  xl: 'px-3.5 py-1 text-sm [&>svg]:size-4',
};

const BADGE_VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: ['bg-primary', 'text-primary-foreground', 'border-primary'].join(' '),
  secondary: ['bg-secondary', 'text-secondary-foreground', 'border-secondary/15'].join(' '),
  destructive: ['bg-destructive', 'text-destructive-foreground', 'border-destructive'].join(' '),
  outline: ['bg-background', 'text-foreground', 'border-border'].join(' '),
  ghost: ['bg-transparent', 'text-foreground', 'border-transparent'].join(' '),
  link: [
    'bg-transparent',
    'text-primary',
    'border-transparent',
    'underline-offset-4',
    'hover:underline',
  ].join(' '),
};

export function buildBadgeClasses({ className, size, variant }: BadgeClassOptions): string {
  return twMerge(BADGE_BASE_CLASSES, BADGE_SIZE_CLASSES[size], BADGE_VARIANT_CLASSES[variant], className);
}
