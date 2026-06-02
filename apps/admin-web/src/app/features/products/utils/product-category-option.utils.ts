import { ProductCategoryOption } from '../components/forms/product-form/types';
import { Category } from '../../../shared/models/category.model';

export const categoryToProductCategoryOption = (category: Category): ProductCategoryOption => ({
    label: category.name,
    value: {
        id: category.id,
        name: category.name,
        slug: category.slug,
    },
});
