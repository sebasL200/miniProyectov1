export class CreateBrandDto {
  name!: string;
  description?: string;
  isActive!: boolean;
  visibleInMenu!: boolean;
  logoUrl!: string;
  website?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export class CreateBatchBrandDto extends CreateBrandDto {
  key!: string;
}
