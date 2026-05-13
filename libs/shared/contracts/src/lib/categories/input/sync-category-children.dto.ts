import { CreateCategoryDto } from './create-category.dto';
import { UpdateCategoryDto } from './update-category.dto';

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
