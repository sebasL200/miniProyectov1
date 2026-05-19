import { twMerge } from 'tailwind-merge';
import { InputImageUploadSize } from './input-image-upload.types';

type InputImageUploadClassOptions = {
  className?: string;
  dragging: boolean;
  disabled: boolean;
  multiple: boolean;
  readonly: boolean;
  size: InputImageUploadSize;
};

const INPUT_IMAGE_UPLOAD_BASE_CLASSES = [
  'flex',
  'w-full',
  'cursor-pointer',
  'gap-3',
  'rounded-sm',
  'border',
  'border-dashed',
  'border-border',
  'bg-background',
  'px-4',
  'text-center',
  'shadow-sm',
  'transition-colors',
  'duration-200',
  'outline-none',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:ring-offset-2',
  'focus-visible:ring-offset-background',
].join(' ');

const INPUT_IMAGE_UPLOAD_SIZE_CLASSES: Record<InputImageUploadSize, string> = {
  sm: 'min-h-28 py-5 text-sm',
  md: 'min-h-36 py-7 text-base',
  lg: 'min-h-44 py-9 text-base',
};

const INPUT_IMAGE_UPLOAD_MODE_CLASSES = {
  multiple: 'flex-col items-center justify-center text-center',
  single:
    'flex-col items-stretch justify-start text-left md:flex-row md:items-center',
};

export function buildInputImageUploadClasses({
  className,
  dragging,
  disabled,
  multiple,
  readonly,
  size,
}: InputImageUploadClassOptions): string {
  return twMerge(
    INPUT_IMAGE_UPLOAD_BASE_CLASSES,
    INPUT_IMAGE_UPLOAD_SIZE_CLASSES[size],
    multiple
      ? INPUT_IMAGE_UPLOAD_MODE_CLASSES.multiple
      : INPUT_IMAGE_UPLOAD_MODE_CLASSES.single,
    dragging && !disabled && !readonly && 'border-primary bg-primary/5',
    (disabled || readonly) && 'cursor-not-allowed opacity-50',
    className,
  );
}
