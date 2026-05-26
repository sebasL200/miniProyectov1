import {
  CategoryDto,
  CategoryWithChildrenDto,
  CategorySummaryDto,
} from '@org/contracts';

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  visibleInMenu: boolean;
  parentId: string | null;
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  attributes?: { id: string }[];
  description: string | null;
  imageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export function toCategoryDto(row?: CategoryRow | null): CategoryDto | null {
  if (!row) {
    return null;
  }

  const parent: CategorySummaryDto | undefined = row.parent
    ? {
        id: row.parent.id,
        name: row.parent.name,
        slug: row.parent.slug,
      }
    : undefined;

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    isActive: row.isActive,
    visibleInMenu: row.visibleInMenu,
    parent,
    hasAttributes: Boolean(row.attributes?.length),
    parentId: row.parentId ?? undefined,
    parentName: row.parent?.name ?? undefined,
    description: row.description ?? undefined,
    imageUrl: row.imageUrl ?? undefined,
    metaTitle: row.metaTitle ?? undefined,
    metaDescription: row.metaDescription ?? undefined,
    createdAt: row.createdAt ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}

export interface CategoryNode {
  category: CategoryRow;
  children: CategoryNode[];
}

export function toCategoryWithChildrenDto(
  node: CategoryNode,
): CategoryWithChildrenDto {
  return {
    ...(toCategoryDto(node.category) as CategoryDto),
    children: node.children.map(toCategoryWithChildrenDto),
  };
}
