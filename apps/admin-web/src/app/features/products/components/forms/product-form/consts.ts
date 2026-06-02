import { ProductFormData } from "./types";

export const DEFAULT_PRODUCT_FORM_DATA: ProductFormData = {
    name: '',
    shortDescription: '',
    description: '',
    categories: [],
    brandId: '',
    modelYear: '',
    attributes: [],
    isActive: true,
    basePrice: 0,
    sku: '',
    isFeatured: false,
    tags: [],
    weight: '',
    dimensions: {
        length: '',
        width: '',
        height: '',
    },
    metaTitle: '',
    metaDescription: '',
}
