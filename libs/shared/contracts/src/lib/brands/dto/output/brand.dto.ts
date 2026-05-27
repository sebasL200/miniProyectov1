export class BrandDto {
  id!: string;
  name!: string;
  visibleInMenu!: boolean;
  slug!: string;
  logoUrl?: string;
  description?: string;
  website?: string;
  metaTitle?: string;
  metaDescription?: string;
  isActive!: boolean;
  createdAt!: Date | null;
  updatedAt!: Date | null;
}