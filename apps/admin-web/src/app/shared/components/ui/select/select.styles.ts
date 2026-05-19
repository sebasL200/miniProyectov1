import {
  buildInputSelectContainerClasses,
  buildInputSelectDropdownClasses,
  buildInputSelectIconClasses,
  buildInputSelectOptionClasses,
  buildInputSelectSearchInputClasses,
  buildInputSelectTriggerClasses,
  INPUT_SELECT_EMPTY_STATE_CLASSES,
  INPUT_SELECT_LABEL_CLASSES,
  INPUT_SELECT_OPTIONS_WRAPPER_CLASSES,
  INPUT_SELECT_SEARCH_WRAPPER_CLASSES,
} from '../input-select/input-select.styles';
import { SelectDirection, SelectSize } from './select.types';
import { twMerge } from 'tailwind-merge';

type SelectContainerClassOptions = {
  className?: string;
};

type SelectTriggerClassOptions = {
  size: SelectSize;
  invalid: boolean;
  disabled: boolean;
  readonly: boolean;
  open: boolean;
};

type SelectDropdownClassOptions = {
  open: boolean;
  direction: SelectDirection;
};

type SelectOptionClassOptions = {
  size: SelectSize;
  selected: boolean;
  disabled: boolean;
};

export function buildSelectContainerClasses(options: SelectContainerClassOptions): string {
  return buildInputSelectContainerClasses(options);
}

export function buildSelectTriggerClasses(options: SelectTriggerClassOptions): string {
  return buildInputSelectTriggerClasses(options);
}

export function buildSelectIconClasses({ open }: { open: boolean }): string {
  return buildInputSelectIconClasses({ open });
}

export function buildSelectDropdownClasses(options: SelectDropdownClassOptions): string {
  return buildInputSelectDropdownClasses(options);
}

export function buildSelectSearchInputClasses(size: SelectSize): string {
  return buildInputSelectSearchInputClasses(size);
}

export function buildSelectOptionClasses(options: SelectOptionClassOptions): string {
  return twMerge(buildInputSelectOptionClasses(options), 'gap-2', 'justify-between');
}

export function buildSelectOptionIndicatorClasses({ selected }: { selected: boolean }): string {
  return twMerge(
    'shrink-0 text-primary transition-opacity duration-150',
    selected ? 'opacity-100' : 'opacity-0',
  );
}

export const SELECT_LABEL_CLASSES = INPUT_SELECT_LABEL_CLASSES;
export const SELECT_OPTIONS_WRAPPER_CLASSES = INPUT_SELECT_OPTIONS_WRAPPER_CLASSES;
export const SELECT_SEARCH_WRAPPER_CLASSES = INPUT_SELECT_SEARCH_WRAPPER_CLASSES;
export const SELECT_EMPTY_STATE_CLASSES = INPUT_SELECT_EMPTY_STATE_CLASSES;
export const SELECT_OPTION_LABEL_CLASSES = ['min-w-0', 'flex-1', 'truncate'].join(' ');
