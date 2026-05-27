import { UpdateCategoryDto } from '@org/contracts';
import { CategoryDto } from '@org/contracts';

export type UpdateCategoryInput = {
  id: string;
  changes: UpdateCategoryDto;
};
export type UpdateCategoryOutput = CategoryDto | null;


