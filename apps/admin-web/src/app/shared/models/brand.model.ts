export interface Brand {
  id: string;
  name: string;
  logoUrl: string;
  visibleInMenu: boolean;
  slug: string;
  description: string;
  website: string;
  metaTitle: string;
  metaDescription: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}


export type BrandSummary = Pick<Brand, 'id' | 'name' | 'slug'>;
