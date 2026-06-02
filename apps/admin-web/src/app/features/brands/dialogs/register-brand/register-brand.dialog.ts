import { Component, inject, signal } from '@angular/core';
import { IDialogComponent } from '../../../../shared/components/ui/dialog/interfaces/dialog-component.interface';
import { DialogRef } from '../../../../shared/components/ui/dialog/models/dialog-ref.model';
import { Brand } from '../../../../shared/models';
import { BrandForm } from '../../components/forms/brand-form/brand-form';
import { FormActionsOptions, FormEvent } from '../../../../shared/interfaces';
import { BrandService } from '../../services/brand/brand.service';
import { BrandFormData } from '../../components/forms/brand-form/types';
import { SaveBrandRequest } from '../../services/brand/types';

@Component({
    selector: 'app-register-brand-dialog',
    imports: [BrandForm],
    templateUrl: './register-brand.dialog.html',
    styleUrl: './register-brand.dialog.css',
    providers: [BrandService],
})
export class RegisterBrandDialog implements IDialogComponent<undefined, Brand | undefined> {
    private readonly brandService: BrandService = inject(BrandService);

    brandFormActions = signal<FormActionsOptions>(
        new FormActionsOptions({
            submitButtonVariant: 'secondary',
        }),
    );

    dialogRef = signal<DialogRef<void, Brand> | null>(null);

    onSubmit(event: FormEvent<BrandFormData>): void {
        const data = event.data;
        if (!data) {
            console.error('Form data is invalid');
            return;
        }
        const request = this.formDataToSaveBrandRequest(data);
        this.brandService.saveBrand(request).subscribe({
            next: (response) => {
                this.dialogRef()?.close(response.data);
            },
        });
    }

    private formDataToSaveBrandRequest(formData: BrandFormData): SaveBrandRequest {
        return {
            name: formData.name,
            logoUrl: this.toBrandLogoUrl(formData.logoUrl),
            description: formData.description,
            metaTitle: formData.metaTitle,
            website: formData.website,
            metaDescription: formData.metaDescription,
            visibleInMenu: formData.visibleInMenu,
            isActive: formData.isActive,
        };
    }

    private toBrandLogoUrl(value: string[]): string {
        return value[0] ?? '';
    }

    setDialogRef(ref: DialogRef<void, Brand>): void {
        this.dialogRef.set(ref);
    }
}
