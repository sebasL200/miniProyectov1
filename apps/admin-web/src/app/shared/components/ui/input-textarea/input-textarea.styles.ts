import { twMerge } from 'tailwind-merge';
import { InputTextareaResize, InputTextareaSize } from './input-textarea.types';

type InputTextareaClassOptions = {
  className?: string;
  size: InputTextareaSize;
  resize: InputTextareaResize;
};

const INPUT_TEXTAREA_BASE_CLASSES = [
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

const INPUT_TEXTAREA_SIZE_CLASSES: Record<InputTextareaSize, string> = {
  xs: 'min-h-20 px-2.5 py-2 text-xs',
  sm: 'min-h-24 px-3 py-2.5 text-sm',
  md: 'min-h-28 px-4 py-3 text-base',
  lg: 'min-h-32 px-5 py-3.5 text-lg',
  xl: 'min-h-36 px-6 py-4 text-xl',
};

const INPUT_TEXTAREA_RESIZE_CLASSES: Record<InputTextareaResize, string> = {
  none: 'resize-none',
  horizontal: 'resize-x',
  vertical: 'resize-y',
  both: 'resize',
};

export function buildInputTextareaClasses({
  className,
  size,
  resize,
}: InputTextareaClassOptions): string {
  return twMerge(
    INPUT_TEXTAREA_BASE_CLASSES,
    INPUT_TEXTAREA_SIZE_CLASSES[size],
    INPUT_TEXTAREA_RESIZE_CLASSES[resize],
    className,
  );
}
