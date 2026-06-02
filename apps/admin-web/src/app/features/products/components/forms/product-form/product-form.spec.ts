import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductForm } from './product-form';
import { ProductFormService } from './product-form.service';
import { AttributeSummary } from '../../../../../shared/models/attribute.model';
import { Validators } from '@angular/forms';
import { FormActions } from '../../../../../shared/components/form-actions/form-actions';
import { By } from '@angular/platform-browser';

describe('ProductForm', () => {
    let component: ProductForm;
    let fixture: ComponentFixture<ProductForm>;
    let service: ProductFormService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProductForm],
        }).compileComponents();

        fixture = TestBed.createComponent(ProductForm);
        component = fixture.componentInstance;
        service = TestBed.inject(ProductFormService);
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should require attributes when categories do not provide attributes', () => {
        expect(component.formGroup.controls.attributes.hasValidator(Validators.required)).toBe(
            true,
        );
    });

    it('should not require additional attributes when categories provide attributes', () => {
        fixture.detectChanges();
        const categoryAttribute: AttributeSummary = {
            id: 'category-attribute-id',
            name: 'Color',
            slug: 'color',
        };

        service.attributesByCategoriesLoaded$.next([categoryAttribute]);

        expect(component.formGroup.controls.attributes.hasValidator(Validators.required)).toBe(
            false,
        );
    });

    it('should require attributes again when categories do not provide attributes', () => {
        fixture.detectChanges();
        const categoryAttribute: AttributeSummary = {
            id: 'category-attribute-id',
            name: 'Color',
            slug: 'color',
        };

        service.attributesByCategoriesLoaded$.next([categoryAttribute]);
        service.attributesByCategoriesLoaded$.next([]);

        expect(component.formGroup.controls.attributes.hasValidator(Validators.required)).toBe(
            true,
        );
    });

    it('should keep category attributes out of the attributes control', () => {
        fixture.detectChanges();
        const categoryAttribute: AttributeSummary = {
            id: 'category-attribute-id',
            name: 'Color',
            slug: 'color',
        };
        const additionalAttribute: AttributeSummary = {
            id: 'additional-attribute-id',
            name: 'Material',
            slug: 'material',
        };

        component.formGroup.controls.attributes.setValue([
            categoryAttribute,
            additionalAttribute,
        ]);
        service.attributesByCategoriesLoaded$.next([categoryAttribute]);

        expect(component.formGroup.controls.attributes.value).toEqual([
            additionalAttribute,
        ]);
        expect((component as unknown as { attributesRequired: () => AttributeSummary[] }).attributesRequired()).toEqual([
            categoryAttribute,
        ]);
    });

    it('should keep selected additional attributes when categories provide other attributes', () => {
        fixture.detectChanges();
        const categoryAttribute: AttributeSummary = {
            id: 'category-attribute-id',
            name: 'Color',
            slug: 'color',
        };
        const additionalAttribute: AttributeSummary = {
            id: 'additional-attribute-id',
            name: 'Material',
            slug: 'material',
        };

        component.formGroup.controls.attributes.setValue([additionalAttribute]);
        service.attributesByCategoriesLoaded$.next([categoryAttribute]);

        expect(component.formGroup.controls.attributes.value).toEqual([
            additionalAttribute,
        ]);
    });

    it('should not remove selected additional attributes missing from current options', () => {
        const additionalAttribute: AttributeSummary = {
            id: 'additional-attribute-id',
            name: 'Material',
            slug: 'material',
        };

        component.formGroup.controls.attributes.setValue([additionalAttribute]);
        fixture.componentRef.setInput('attributesOptions', []);
        fixture.detectChanges();

        expect(component.formGroup.controls.attributes.value).toEqual([
            additionalAttribute,
        ]);
    });

    it('should keep category-driven attributes when cancel is requested', async () => {
        fixture.detectChanges();
        await fixture.whenStable();
        const categoryAttribute: AttributeSummary = {
            id: 'category-attribute-id',
            name: 'Color',
            slug: 'color',
        };

        service.attributesByCategoriesLoaded$.next([categoryAttribute]);
        fixture.debugElement.query(By.directive(FormActions)).componentInstance.cancel.emit();
        await fixture.whenStable();

        expect(
            (component as unknown as { attributesRequired: () => AttributeSummary[] }).attributesRequired(),
        ).toEqual([categoryAttribute]);
        expect(component.formGroup.controls.attributes.hasValidator(Validators.required)).toBe(
            false,
        );
    });
});
