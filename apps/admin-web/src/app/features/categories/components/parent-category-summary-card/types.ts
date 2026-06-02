import { Category, CategorySummary as BaseCategorySummary } from '../../../../shared/models/category.model';

export type CategorySummary = BaseCategorySummary & Pick<Category, 'description'>;
