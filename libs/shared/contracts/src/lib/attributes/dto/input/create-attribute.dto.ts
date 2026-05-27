export interface CreateAttributeDto {
  name: string;
  description?: string;
  isActive?: boolean;
  isFilterable?: boolean;
  appliesToAll?: boolean;
  isRequired?: boolean;
  categoryIds?: string[];
}

export interface CreateBatchAttributeDto extends CreateAttributeDto {
  key: string;
}
