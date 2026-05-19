import { AttributeSummary } from './attribute.model';
import { BrandSummary } from './brand.model';
import { CategorySummary } from './category.model';

type VariantReferenceSummary = {
    id: string;
    sku: string;
};

export interface ProductDimensions {
    width: string;
    height: string;
    length: string;
    weight: string;
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    categoriesId?: string[];
    categories: CategorySummary[];
    descriptionHtml: string;
    isActive: boolean;
    isFeatured: boolean;
    modelYear: number | string;
    descriptionShort?: string;
    brandId?: string;
    brand?: BrandSummary;
    dimensionsBase: ProductDimensions;
    directAttributes: AttributeSummary[];
    attributes: AttributeSummary[];
    variants: VariantReferenceSummary[];
    createdAt: Date | null;
    updatedAt: Date | null;
}


export type ProductSummary = Pick<Product, 'id' | 'name' | 'slug'>;
