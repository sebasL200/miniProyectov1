import { twMerge } from 'tailwind-merge';
import { InputTextSize } from './input-text.types';

type InputTextClassOptions = {
  className?: string;
  size: InputTextSize;
};

const INPUT_TEXT_BASE_CLASSES = [
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
  'disabled:cursor-not-allowed',
  'disabled:opacity-50',
].join(' ');

const INPUT_TEXT_SIZE_CLASSES: Record<InputTextSize, string> = {
  xs: 'h-7 px-2.5 text-xs',
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-11 px-5 text-lg',
  xl: 'h-12 px-6 text-xl',
};

export function buildInputTextClasses({ className, size }: InputTextClassOptions): string {
  return twMerge(INPUT_TEXT_BASE_CLASSES, INPUT_TEXT_SIZE_CLASSES[size], className);
}
