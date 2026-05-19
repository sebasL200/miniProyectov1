export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  visibleInMenu: boolean;
  parentId: string | null;
  parentName: string | null;
  description: string;
  imageUrl?: string | null;
  metaTitle: string;
  metaDescription: string;
  children: Category[];
  createdAt: Date;
  updatedAt: Date;
}

export type CategorySummary = Pick<Category, 'id' | 'name' | 'slug'>;
