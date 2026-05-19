import { twMerge } from 'tailwind-merge';
import { InputDateSize } from './input-date.types';

type InputDateClassOptions = {
  className?: string;
  size: InputDateSize;
};

const INPUT_DATE_BASE_CLASSES = [
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
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background',
  'disabled:cursor-not-allowed',
  'disabled:opacity-50',
].join(' ');

const INPUT_DATE_SIZE_CLASSES: Record<InputDateSize, string> = {
  xs: 'h-7 px-2.5 text-xs',
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-base',
  lg: 'h-11 px-5 text-lg',
  xl: 'h-12 px-6 text-xl',
};

export function buildInputDateClasses({ className, size }: InputDateClassOptions): string {
  return twMerge(INPUT_DATE_BASE_CLASSES, INPUT_DATE_SIZE_CLASSES[size], className);
}
