import { CategorySummary } from "./category.model";

export interface Attribute {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  isFilterable: boolean;
  appliesToAll: boolean;
  isRequired: boolean;
  slug: string;
  categories: CategorySummary[];
}

export type AttributeSummary = Pick<Attribute, 'id' | 'name' | 'slug'>;
