export type InputSelectSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type InputSelectDirection = 'up' | 'down';

export type SearchType = 'client' | 'server';

export interface InputSelectOption<TValue = unknown> {
  label: string;
  value: TValue;
  disabled?: boolean;
}
