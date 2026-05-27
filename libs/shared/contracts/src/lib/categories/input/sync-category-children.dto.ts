import { CreateCategoryDto } from './create-category.dto.js';
import { UpdateCategoryDto } from './update-category.dto.js';

export class NewCategoryItemDto extends CreateCategoryDto {
  key!: string;
}

export class UpdateCategoryItemDto {
  id!: string;
  changes!: UpdateCategoryDto;
}

export class SyncCategoryChildrenDto {
  id!: string;
  newCategories!: NewCategoryItemDto[];
  updateCategories!: UpdateCategoryItemDto[];
  deleteCategories!: string[];
}
