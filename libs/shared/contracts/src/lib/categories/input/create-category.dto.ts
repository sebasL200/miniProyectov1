export class CreateCategoryDto {
  name!: string;
  parentId?: string;
  description?: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive!: boolean;
  visibleInMenu!: boolean;
}

export class CreateBatchCategoryDto extends CreateCategoryDto {
  key!: string;
}
