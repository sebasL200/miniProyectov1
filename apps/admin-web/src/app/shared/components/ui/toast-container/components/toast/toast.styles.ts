import { twMerge } from 'tailwind-merge';
import { ToastStatus, ToastType } from './toast.types';

type ToastClassOptions = {
  className?: string;
  status: ToastStatus;
  type: ToastType;
};

type ToastVariantClassOptions = {
  className?: string;
  type: ToastType;
};

const TOAST_BASE_CLASSES = [
  'pointer-events-auto',
  'flex',
  'items-center',
  'min-w-sm',
  'max-w-lg',
  'gap-3',
  'overflow-hidden',
  'rounded-md',
  'border',
  'p-3',
  'shadow-lg',
  'backdrop-blur-xs',
  'transition-all',
  'duration-300',
  'ease-out',
  'will-change-transform',
].join(' ');

const TOAST_TYPE_CLASSES: Record<ToastType, string> = {
  success: ['border-success/20', 'bg-success-background', 'text-success', 'shadow-success/10'].join(' '),
  warning: ['border-warning/25', 'bg-warning-background', 'text-warning', 'shadow-warning/10'].join(' '),
  error: ['border-destructive/20', 'bg-destructive-background', 'text-destructive', 'shadow-destructive/10'].join(
    ' ',
  ),
  info: ['border-info/20', 'bg-info-background', 'text-info', 'shadow-info/10'].join(' '),
};

const TOAST_STATUS_CLASSES: Record<ToastStatus, string> = {
  opening: 'opacity-0 -translate-y-3 scale-95',
  open: 'opacity-100 translate-y-0 scale-100',
  closing: 'opacity-0 -translate-y-2 scale-95',
  closed: 'pointer-events-none opacity-0 -translate-y-2 scale-95',
};

const TOAST_CLOSE_BUTTON_BASE_CLASSES = ['shrink-0', 'self-start', 'rounded-sm'].join(' ');

const TOAST_CLOSE_BUTTON_TYPE_CLASSES: Record<ToastType, string> = {
  success: ['text-success', 'hover:bg-success/10', 'active:bg-success/15', 'focus-visible:ring-success/30'].join(' '),
  warning: ['text-warning', 'hover:bg-warning/10', 'active:bg-warning/15', 'focus-visible:ring-warning/30'].join(' '),
  error: [
    'text-destructive',
    'hover:bg-destructive/10',
    'active:bg-destructive/15',
    'focus-visible:ring-destructive/30',
  ].join(' '),
  info: ['text-info', 'hover:bg-info/10', 'active:bg-info/15', 'focus-visible:ring-info/30'].join(' '),
};

export function buildToastClasses({ className, status, type }: ToastClassOptions): string {
  return twMerge(TOAST_BASE_CLASSES, TOAST_TYPE_CLASSES[type], TOAST_STATUS_CLASSES[status], className);
}

export function buildToastCloseButtonClasses({ className, type }: ToastVariantClassOptions): string {
  return twMerge(TOAST_CLOSE_BUTTON_BASE_CLASSES, TOAST_CLOSE_BUTTON_TYPE_CLASSES[type], className);
}
