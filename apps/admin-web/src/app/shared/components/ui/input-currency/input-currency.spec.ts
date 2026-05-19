import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { InputCurrency } from './input-currency';

@Component({
    standalone: true,
    imports: [ReactiveFormsModule, InputCurrency],
    template: `
        <form [formGroup]="form">
            <ecom-input-currency formControlName="value" />
        </form>
    `,
})
class InputCurrencyReactiveHost {
    readonly form = new FormGroup({
        value: new FormControl<number | null>(250, { nonNullable: true }),
    });
}

describe('InputCurrency', () => {
    let component: InputCurrency;
    let fixture: ComponentFixture<InputCurrency>;
    let input: HTMLInputElement;
    let symbol: HTMLSpanElement;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [InputCurrency, InputCurrencyReactiveHost],
        }).compileComponents();

        fixture = TestBed.createComponent(InputCurrency);
        component = fixture.componentInstance;
        await fixture.whenStable();
        fixture.detectChanges();
        input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
        symbol = fixture.nativeElement.querySelector('span') as HTMLSpanElement;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should render the peso symbol on the left side', () => {
        expect(symbol.textContent?.trim()).toBe('$');
        expect(symbol.className).toContain('absolute');
        expect(symbol.className).toContain('left-0');
    });

    it('should apply the default input classes', () => {
        expect(input.className).toContain('h-10');
        expect(input.className).toContain('w-full');
        expect(input.className).toContain('border-border');
        expect(input.className).toContain('bg-background');
        expect(input.className).toContain('pl-9');
        expect(input.className).toContain('text-base');
    });

    it('should update the input and symbol classes when the size changes', async () => {
        fixture.componentRef.setInput('size', 'xl');
        await fixture.whenStable();
        fixture.detectChanges();

        expect(input.className).toContain('h-12');
        expect(input.className).toContain('pl-11');
        expect(input.className).toContain('text-xl');
        expect(symbol.className).toContain('pl-6');
        expect(symbol.className).toContain('text-xl');
    });

    it('should merge custom classes into the input element', async () => {
        fixture.componentRef.setInput('class', 'rounded-xl');
        await fixture.whenStable();
        fixture.detectChanges();

        expect(input.className).toContain('rounded-xl');
        expect(input.className).not.toContain('rounded-sm');
    });

    it('should use number as the default input type', () => {
        expect(input.type).toBe('number');
    });

    it('should update the model value on input events', () => {
        input.value = '1499.99';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(component.value()).toBe(1499.99);
    });

    it('should set the model value to null when the input is empty', () => {
        input.value = '';
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();

        expect(component.value()).toBeNull();
    });

    it('should work with formControlName', async () => {
        const hostFixture = TestBed.createComponent(InputCurrencyReactiveHost);
        hostFixture.detectChanges();
        await hostFixture.whenStable();

        const hostComponent = hostFixture.componentInstance;
        const hostInput = hostFixture.nativeElement.querySelector('input') as HTMLInputElement;

        expect(hostInput.value).toBe('250');

        hostInput.value = '375.50';
        hostInput.dispatchEvent(new Event('input'));
        hostFixture.detectChanges();

        expect(hostComponent.form.controls.value.value).toBe(375.5);

        hostComponent.form.controls.value.setValue(999.99);
        hostFixture.detectChanges();

        expect(hostInput.value).toBe('999.99');

        hostComponent.form.controls.value.disable();
        hostFixture.detectChanges();

        expect(hostInput.disabled).toBe(true);
    });
});
