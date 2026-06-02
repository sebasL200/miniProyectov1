import { ProductBrandOption } from '../components/forms/product-form/types';
import { Brand } from '../../../shared/models/brand.model';

export const brandToProductBrandOption = (brand: Brand): ProductBrandOption => ({
    label: brand.name,
    value: brand.id,
});
