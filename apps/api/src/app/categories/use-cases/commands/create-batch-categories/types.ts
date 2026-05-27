import { CreateBatchCategoryDto } from '@org/contracts';
import { CreateBatchCategoriesResultDto } from '@org/contracts';

export type CreateBatchCategoriesInput = {
  categories: CreateBatchCategoryDto[];
};
export type CreateBatchCategoriesOutput = CreateBatchCategoriesResultDto;


