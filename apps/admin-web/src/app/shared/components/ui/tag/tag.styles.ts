import { twMerge } from 'tailwind-merge';
import { TagSize, TagVariant } from './tag.types';

interface TagRootClassesOptions {
  className?: string;
  size: TagSize;
  variant: TagVariant;
}

const TAG_BASE_CLASSES: string = [
  'inline-flex',
  'items-center',
  'justify-center',
  'rounded-md',
].join(' ');

const TAG_SIZE_CLASSES: Record<TagSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-5 py-2.5 text-lg',
  xl: 'px-6 py-3 text-xl',
};

const TAG_VARIANT_CLASSES: Record<TagVariant, string> = {
  primary: 'bg-primary/20 text-primary/70',
  secondary: 'bg-secondary/20 text-secondary/70',
  tertiary: 'bg-tertiary/20 text-tertiary/70',
  outline: 'border border-input bg-background',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

export function buildTagRootClasses({ className, size, variant }: TagRootClassesOptions) {
  return twMerge(TAG_BASE_CLASSES, TAG_SIZE_CLASSES[size], TAG_VARIANT_CLASSES[variant], className);
}
