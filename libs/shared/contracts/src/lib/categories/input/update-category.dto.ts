export class UpdateCategoryDto {
  name?: string;
  parentId?: string;
  description?: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive?: boolean;
  visibleInMenu?: boolean;
}
