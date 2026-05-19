export type SelectSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export type SelectDirection = 'up' | 'down';

export interface SelectOption<TValue = unknown> {
  label: string;
  value: TValue;
  disabled?: boolean;
}
