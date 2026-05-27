import type { BrandDto } from '@org/contracts';

export interface BrandRow {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  isActive: boolean;
  visibleInMenu: boolean;
  logoUrl: string;
  website: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export function toBrandDto(row?: BrandRow | null): BrandDto | null {


  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    logoUrl: row.logoUrl,
    visibleInMenu: row.visibleInMenu,
    slug: row.slug,
    description: row.description ?? undefined,
    website: row.website ?? undefined,
    metaTitle: row.metaTitle ?? undefined,
    metaDescription: row.metaDescription ?? undefined,
    isActive: row.isActive,
    createdAt: row.createdAt ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}

