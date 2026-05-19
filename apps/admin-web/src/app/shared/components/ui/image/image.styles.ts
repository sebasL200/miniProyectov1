import { twMerge } from 'tailwind-merge';
import { ImageSize } from './image.types';

type ImageClassOptions = {
  className?: string;
  size: ImageSize;
};

const IMAGE_BASE_CLASSES = ['block', 'h-auto', 'max-w-full'].join(' ');
const IMAGE_PLACEHOLDER_BASE_CLASSES = [
  'image-placeholder',
  'flex',
  'aspect-square',
  'items-center',
  'justify-center',
  'overflow-hidden',
  'rounded-md',
  'border',
  'border-dashed',
  'border-border',
  'bg-muted',
  'text-muted-foreground',
].join(' ');
const IMAGE_ERROR_SLOT_BASE_CLASSES = [
  'image-error-slot',
  'flex',
  'aspect-square',
  'items-center',
  'justify-center',
  'overflow-hidden',
  'rounded-md',
  'text-center',
].join(' ');

const IMAGE_SIZE_CLASSES: Record<ImageSize, string> = {
  xxs: 'w-6',
  xs: 'w-8',
  sm: 'w-10',
  md: 'w-12',
  lg: 'w-16',
  xl: 'w-20',
  '2xl': 'w-24',
};

const IMAGE_PLACEHOLDER_ICON_SIZE_CLASSES: Record<ImageSize, string> = {
  xxs: 'text-xs',
  xs: 'text-sm',
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
  '2xl': 'text-3xl',
};

export function buildImageClasses({ className, size }: ImageClassOptions): string {
  return twMerge(IMAGE_BASE_CLASSES, IMAGE_SIZE_CLASSES[size], className);
}

export function buildImagePlaceholderClasses({ className, size }: ImageClassOptions): string {
  return twMerge(IMAGE_PLACEHOLDER_BASE_CLASSES, IMAGE_SIZE_CLASSES[size], className);
}

export function buildImageErrorSlotClasses({ className, size }: ImageClassOptions): string {
  return twMerge(IMAGE_ERROR_SLOT_BASE_CLASSES, IMAGE_SIZE_CLASSES[size], className);
}

export function buildImagePlaceholderIconClasses(size: ImageSize): string {
  return twMerge('pointer-events-none', IMAGE_PLACEHOLDER_ICON_SIZE_CLASSES[size]);
}
