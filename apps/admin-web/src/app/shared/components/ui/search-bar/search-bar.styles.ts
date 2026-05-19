import { twMerge } from 'tailwind-merge';
import { SearchBarSize } from './search-bar.types';

type SearchBarClassOptions = {
  className?: string;
  size: SearchBarSize;
};

const SEARCH_BAR_BASE_CLASSES = [
  'md:flex',
  'items-center',
  'gap-1',
  'bg-primary-background',
  'rounded-md',
  'hidden',
  'md:w-md',
  'xl:w-2xl',
].join(' ');

const SEARCH_BAR_SIZE_CLASSES: Record<SearchBarSize, string> = {
  xs: 'h-7 px-2.5 text-xs',
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-11 px-5 text-lg',
  xl: 'h-12 px-6 text-xl',
};

export const SEARCH_BAR_INPUT_CLASSES = [
  'w-full',
  'bg-transparent',
  'outline-none',
  'placeholder:text-muted-foreground',
  'disabled:cursor-not-allowed',
].join(' ');

export const SEARCH_BAR_ICON_CLASSES = ['shrink-0', 'text-muted-foreground', 'opacity-60'].join(
  ' ',
);

export function buildSearchBarClasses({ className, size }: SearchBarClassOptions): string {
  return twMerge(SEARCH_BAR_BASE_CLASSES, SEARCH_BAR_SIZE_CLASSES[size], className);
}
