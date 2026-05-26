import { Category, CategorySummary as BaseCategorySummary } from "@shared/models";

export type CategorySummary = BaseCategorySummary & Pick<Category, 'description'>;
