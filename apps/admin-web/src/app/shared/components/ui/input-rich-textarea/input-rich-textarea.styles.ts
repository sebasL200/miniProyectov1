import { twMerge } from 'tailwind-merge';
import { InputRichTextareaSize } from './input-rich-textarea.types';

type InputRichTextareaClassOptions = {
  className?: string;
  focused: boolean;
  disabled: boolean;
  readonly: boolean;
};

type InputRichTextareaEditorClassOptions = {
  size: InputRichTextareaSize;
  disabled: boolean;
  readonly: boolean;
};

const INPUT_RICH_TEXTAREA_BASE_CLASSES = [
  'ecom-input-rich-textarea',
  'block',
  'w-full',
  'overflow-hidden',
  'rounded-sm',
  'border',
  'border-border',
  'bg-background',
  'text-foreground',
  'shadow-sm',
  'transition-[border-color,box-shadow,background-color]',
  'duration-200',
].join(' ');

const INPUT_RICH_TEXTAREA_EDITOR_BASE_CLASSES = [
  'ecom-input-rich-textarea__editor',
  'block',
  'w-full',
  'outline-none',
  'whitespace-pre-wrap',
  'break-words',
  'overflow-y-auto',
].join(' ');

const INPUT_RICH_TEXTAREA_EDITOR_SIZE_CLASSES: Record<InputRichTextareaSize, string> = {
  xs: 'min-h-20 px-2.5 py-2 text-xs',
  sm: 'min-h-24 px-3 py-2.5 text-sm',
  md: 'min-h-32 px-4 py-3 text-base',
  lg: 'min-h-36 px-5 py-3.5 text-lg',
  xl: 'min-h-40 px-6 py-4 text-xl',
};

const INPUT_RICH_TEXTAREA_PLACEHOLDER_SIZE_CLASSES: Record<InputRichTextareaSize, string> = {
  xs: 'left-2.5 top-2 text-xs',
  sm: 'left-3 top-2.5 text-sm',
  md: 'left-4 top-3 text-base',
  lg: 'left-5 top-3.5 text-lg',
  xl: 'left-6 top-4 text-xl',
};

export function buildInputRichTextareaClasses({
  className,
  focused,
  disabled,
  readonly,
}: InputRichTextareaClassOptions): string {
  return twMerge(
    INPUT_RICH_TEXTAREA_BASE_CLASSES,
    focused && 'border-ring ring-2 ring-ring/10',
    disabled && 'cursor-not-allowed opacity-50',
    !disabled && readonly && 'bg-muted/30',
    className,
  );
}

export const INPUT_RICH_TEXTAREA_TOOLBAR_CLASSES = [
  'ecom-input-rich-textarea__toolbar',
  'flex',
  'flex-wrap',
  'items-center',
  'gap-1',
  'border-b',
  'border-border',
  'bg-muted/20',
  'p-2',
].join(' ');

export const INPUT_RICH_TEXTAREA_TOOLBAR_DIVIDER_CLASSES = [
  'mx-1',
  'h-6',
  'w-px',
  'shrink-0',
  'bg-border',
].join(' ');

export const INPUT_RICH_TEXTAREA_TOOLBAR_SELECT_WRAPPER_CLASSES = [
  'inline-flex',
  'h-8',
  'items-center',
  'gap-2',
  'rounded-sm',
  'border',
  'border-transparent',
  'bg-transparent',
  'px-2',
  'text-sm',
  'text-muted-foreground',
  'transition-colors',
  'duration-150',
  'hover:bg-accent/70',
].join(' ');

export const INPUT_RICH_TEXTAREA_TOOLBAR_SELECT_PREFIX_CLASSES = [
  'shrink-0',
  'text-xs',
  'font-semibold',
  'uppercase',
  'tracking-wide',
  'text-muted-foreground',
].join(' ');

export const INPUT_RICH_TEXTAREA_TOOLBAR_SELECT_CLASSES = [
  'min-w-28',
  'appearance-none',
  'border-0',
  'bg-transparent',
  'text-sm',
  'text-foreground',
  'outline-none',
  'disabled:cursor-not-allowed',
  'disabled:opacity-50',
].join(' ');

export const INPUT_RICH_TEXTAREA_EDITOR_CONTAINER_CLASSES = [
  'ecom-input-rich-textarea__editor-container',
  'relative',
].join(' ');

export function buildInputRichTextareaEditorClasses({
  size,
  disabled,
  readonly,
}: InputRichTextareaEditorClassOptions): string {
  return twMerge(
    INPUT_RICH_TEXTAREA_EDITOR_BASE_CLASSES,
    INPUT_RICH_TEXTAREA_EDITOR_SIZE_CLASSES[size],
    disabled && 'cursor-not-allowed select-none',
    !disabled && readonly && 'cursor-default',
  );
}

export function buildInputRichTextareaPlaceholderClasses(size: InputRichTextareaSize): string {
  return twMerge(
    'pointer-events-none absolute text-muted-foreground',
    INPUT_RICH_TEXTAREA_PLACEHOLDER_SIZE_CLASSES[size],
  );
}
