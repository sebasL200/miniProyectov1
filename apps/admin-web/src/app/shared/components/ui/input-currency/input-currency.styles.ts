import { twMerge } from 'tailwind-merge';
import { InputCurrencySize } from './input-currency.types';

type InputCurrencyClassOptions = {
    className?: string;
    size: InputCurrencySize;
};

const INPUT_CURRENCY_BASE_CLASSES = [
    'block',
    'w-full',
    'rounded-sm',
    'border',
    'border-border',
    'bg-background',
    'text-foreground',
    'shadow-sm',
    'transition-colors',
    'duration-200',
    'outline-none',
    'placeholder:text-muted-foreground',
    'focus-visible:ring-2',
    'focus-visible:ring-ring',
    'focus-visible:ring-offset-2',
    'focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed',
    'disabled:opacity-50',
].join(' ');

const INPUT_CURRENCY_SIZE_CLASSES: Record<InputCurrencySize, string> = {
    xs: 'h-7 pr-2.5 pl-7 text-xs',
    sm: 'h-8 pr-3 pl-8 text-sm',
    md: 'h-10 pr-4 pl-9 text-base',
    lg: 'h-11 pr-5 pl-10 text-lg',
    xl: 'h-12 pr-6 pl-11 text-xl',
};

const INPUT_CURRENCY_SYMBOL_BASE_CLASSES = [
    'pointer-events-none',
    'absolute',
    'inset-y-0',
    'left-0',
    'flex',
    'items-center',
    'select-none',
    'text-muted-foreground',
].join(' ');

const INPUT_CURRENCY_SYMBOL_SIZE_CLASSES: Record<InputCurrencySize, string> = {
    xs: 'pl-2.5 text-xs',
    sm: 'pl-3 text-sm',
    md: 'pl-4 text-base',
    lg: 'pl-5 text-lg',
    xl: 'pl-6 text-xl',
};

export function buildInputCurrencyClasses({ className, size }: InputCurrencyClassOptions): string {
    return twMerge(INPUT_CURRENCY_BASE_CLASSES, INPUT_CURRENCY_SIZE_CLASSES[size], className);
}

export function buildInputCurrencySymbolClasses(size: InputCurrencySize): string {
    return twMerge(INPUT_CURRENCY_SYMBOL_BASE_CLASSES, INPUT_CURRENCY_SYMBOL_SIZE_CLASSES[size]);
}
