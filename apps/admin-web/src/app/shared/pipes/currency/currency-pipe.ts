import { Pipe, PipeTransform } from '@angular/core';
import { Currency } from './types';

@Pipe({
    name: 'currency',
})
export class CurrencyPipe implements PipeTransform {
    transform(
        value: number,
        currency: Currency = 'MXN',
        locale: Intl.LocalesArgument = 'en-US',
    ): string {
        return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
    }
}
