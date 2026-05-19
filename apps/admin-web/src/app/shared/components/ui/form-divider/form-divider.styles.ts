import { twMerge } from 'tailwind-merge';
import { LabelPosition } from './form-divider.types';

export interface FormDividerClassOptions {
  className?: string;
  labelPosition: LabelPosition;
}

const FORM_DIVIDER_BASE_CLASSES = ['flex', 'items-center', 'w-full', 'gap-3'].join(' ');

const LABEL_POSITION_CLASSES: Record<LabelPosition, string> = {
  left: 'flex-row',
  right: 'flex-row-reverse',
  middle: 'flex-row',
};

export function buildFormDividerClasses({
  className,
  labelPosition,
}: FormDividerClassOptions): string {
  return twMerge(FORM_DIVIDER_BASE_CLASSES, LABEL_POSITION_CLASSES[labelPosition], className);
}
