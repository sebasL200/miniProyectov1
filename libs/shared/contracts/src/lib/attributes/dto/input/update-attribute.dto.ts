export interface UpdateAttributeDto {
  name?: string;
  description?: string;
  isActive?: boolean;
  isFilterable?: boolean;
  appliesToAll?: boolean;
  isRequired?: boolean;
  categoryIds?: string[];
}
