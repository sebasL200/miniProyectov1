import { CategoryDto } from '@org/contracts';

export type DeleteCategoryInput = {
  id: string;
};
export type DeleteCategoryOutput = {
  category: CategoryDto | null;
};


