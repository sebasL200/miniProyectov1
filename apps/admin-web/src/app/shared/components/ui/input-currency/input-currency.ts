import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    input,
    model,
    signal,
    viewChild,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { buildFormValueControlProvider } from '../../../utils/form-value-control-provider.builder';
import {
    buildInputCurrencyClasses,
    buildInputCurrencySymbolClasses,
} from './input-currency.styles';
import { InputCurrencySize, InputCurrencyType } from './input-currency.types';

@Component({
    selector: 'ecom-input-currency',
    imports: [],
    templateUrl: './input-currency.html',
    styleUrl: './input-currency.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [buildFormValueControlProvider(InputCurrency)],
    host: {
        '[class]': 'hostClasses()',
    },
})
export class InputCurrency
    implements FormValueControl<number | null>, ControlValueAccessor
{
    className = input('', { alias: 'class' });
    size = input<InputCurrencySize>('md');
    type = input<InputCurrencyType>('number');
    value = model<number | null>(null);
    inputId = input<string>('');
    name = input<string>('');
    title = input<string>('');
    placeholder = input<string>('0.00');
    disabled = input(false, { transform: booleanAttribute });
    readonly = input(false, { transform: booleanAttribute });
    required = input(false, { transform: booleanAttribute });

    private readonly inputElement =
        viewChild.required<ElementRef<HTMLInputElement>>('inputElement');
    private readonly cvaDisabled = signal(false);
    private onChange: (value: number | null) => void = () => {};
    private onTouched: () => void = () => {};

    hostClasses = computed(() => 'contents');
    isDisabled = computed(() => this.disabled() || this.cvaDisabled());
    inputClasses = computed(() =>
        buildInputCurrencyClasses({
            className: this.className(),
            size: this.size(),
        }),
    );
    symbolClasses = computed(() => buildInputCurrencySymbolClasses(this.size()));

    onInput(event: Event): void {
        const input = event.target as HTMLInputElement;
        const nextValue = input.value === '' ? null : input.valueAsNumber;

        this.value.set(nextValue);
        this.onChange(nextValue);
    }

    onBlur(): void {
        this.onTouched();
    }

    writeValue(value: number | null): void {
        this.value.set(value);
    }

    registerOnChange(fn: (value: number | null) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: () => void): void {
        this.onTouched = fn;
    }

    setDisabledState(isDisabled: boolean): void {
        this.cvaDisabled.set(isDisabled);
    }

    focus(options?: FocusOptions): void {
        this.inputElement().nativeElement.focus(options);
    }
}
