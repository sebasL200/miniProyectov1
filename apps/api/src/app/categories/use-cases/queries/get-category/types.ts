import {
  CategoryDto,
  CategoryWithChildrenDto,
} from '@org/contracts';

export type GetCategoryInput = {
  id: string;
  include?: 'children';
};
export type GetCategoryOutput = CategoryDto | CategoryWithChildrenDto | null;


