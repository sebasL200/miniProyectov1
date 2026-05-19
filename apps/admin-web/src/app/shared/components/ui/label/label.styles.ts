import { twMerge } from 'tailwind-merge';
import { LabelSize } from './label.types';

type LabelRootClassOptions = {
  className?: string;
};

type LabelTextClassOptions = {
  className?: string;
  size: LabelSize;
};

const LABEL_ROOT_BASE_CLASSES = [
  'flex',
  'h-full',
  'w-full',
  'flex-col',
  'items-start',
  'gap-1',
].join(' ');

const LABEL_HEADER_BASE_CLASSES = ['flex', 'w-full', 'items-center', 'gap-1'].join(' ');

const LABEL_TEXT_BASE_CLASSES = [
  'leading-none',
  'select-none',
].join(' ');

const LABEL_TEXT_SIZE_CLASSES: Record<LabelSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

const LABEL_REQUIRED_BASE_CLASSES = ['text-destructive', 'font-medium', 'leading-none'].join(' ');

const LABEL_CONTENT_BASE_CLASSES = ['flex-1', 'h-full', 'w-full'].join(' ');

export function buildLabelRootClasses({ className }: LabelRootClassOptions): string {
  return twMerge(LABEL_ROOT_BASE_CLASSES, className);
}

export function buildLabelHeaderClasses(): string {
  return LABEL_HEADER_BASE_CLASSES;
}

export function buildLabelTextClasses({ className, size }: LabelTextClassOptions): string {
  return twMerge(LABEL_TEXT_BASE_CLASSES, LABEL_TEXT_SIZE_CLASSES[size], className);
}

export function buildLabelRequiredClasses(): string {
  return LABEL_REQUIRED_BASE_CLASSES;
}

export function buildLabelContentClasses(): string {
  return LABEL_CONTENT_BASE_CLASSES;
}
