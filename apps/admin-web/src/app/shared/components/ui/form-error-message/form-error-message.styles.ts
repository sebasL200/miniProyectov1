import { twMerge } from 'tailwind-merge';

type FormErrorMessageRootClassOptions = {
  className?: string;
};

const FORM_ERROR_MESSAGE_ROOT_BASE_CLASSES = ['block', 'w-full', 'pt-1'].join(' ');

const FORM_ERROR_MESSAGE_TEXT_BASE_CLASSES = [
  'text-destructive',
  'text-xs',
  'font-medium',
  'leading-tight',
].join(' ');

export function buildFormErrorMessageRootClasses({
  className,
}: FormErrorMessageRootClassOptions): string {
  return twMerge(FORM_ERROR_MESSAGE_ROOT_BASE_CLASSES, className);
}

export function buildFormErrorMessageTextClasses(): string {
  return FORM_ERROR_MESSAGE_TEXT_BASE_CLASSES;
}
