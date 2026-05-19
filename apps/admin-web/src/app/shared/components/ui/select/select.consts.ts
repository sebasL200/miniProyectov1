import { SelectOption } from './select.types';

export function buildPlaceholderOption(label: string): SelectOption<null> {
  return {
    label,
    value: null,
  };
}
