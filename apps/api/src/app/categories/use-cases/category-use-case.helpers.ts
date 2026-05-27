import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CategoryNode, CategoryRow } from '../mappers/categories.mapper';

export const CATEGORY_RESPONSE_INCLUDE = {
  parent: { select: { id: true, name: true, slug: true } },
  attributes: {
    where: { attribute: { deletedAt: null } },
    select: { id: true },
    take: 1,
  },
};

export type CategoryDelegate = {
  create(args: unknown): Promise<CategoryRow>;
  findFirst(args: unknown): Promise<CategoryRow | null>;
  findMany(args: unknown): Promise<CategoryRow[]>;
  update(args: unknown): Promise<CategoryRow>;
  updateMany(args: unknown): Promise<unknown>;
  count(args: unknown): Promise<number>;
};

export function categoryDelegate(prismaClient: unknown): CategoryDelegate {
  return (prismaClient as { category: CategoryDelegate }).category;
}

export async function getExistingCategory(
  category: CategoryDelegate,
  id: string,
): Promise<CategoryRow> {
  const row = await category.findFirst({
    where: { id, deletedAt: null },
    include: CATEGORY_RESPONSE_INCLUDE,
  });

  if (!row) {
    throw new NotFoundException('category not found');
  }

  return row;
}

export async function generateUniqueSlug(
  category: CategoryDelegate,
  value: string,
  exceptId?: string,
) {
  const slug = slugify(value);

  if (!slug) {
    throw new BadRequestException('category slug source is invalid');
  }

  const existing = await category.findFirst({
    where: {
      slug,
      deletedAt: null,
      ...(exceptId ? { id: { not: exceptId } } : {}),
    },
    select: { id: true },
  });

  if (existing) {
    throw new ConflictException('slug already exists');
  }

  return slug;
}

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function validateBackendCategory(input: {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
}) {
  const name = input.name.trim();
  if (name.length < 3 || name.length > 100) {
    throw new BadRequestException(
      'validation error: name must be between 3 and 100 characters',
    );
  }
  if (input.description && input.description.length > 300) {
    throw new BadRequestException(
      'validation error: description must be at most 300 characters',
    );
  }
  if (input.metaTitle && input.metaTitle.length > 100) {
    throw new BadRequestException(
      'validation error: meta_title must be at most 100 characters',
    );
  }
  if (input.metaDescription && input.metaDescription.length > 160) {
    throw new BadRequestException(
      'validation error: meta_description must be at most 160 characters',
    );
  }
}

export async function getDescendants(
  category: CategoryDelegate,
  parentId: string,
): Promise<CategoryRow[]> {
  const descendants: CategoryRow[] = [];
  let frontier = [parentId];

  while (frontier.length > 0) {
    const children = await category.findMany({
      where: { parentId: { in: frontier }, deletedAt: null },
      include: CATEGORY_RESPONSE_INCLUDE,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
    });
    descendants.push(...children);
    frontier = children.map((child) => child.id);
  }

  return descendants;
}

export function buildTree(parent: CategoryRow, descendants: CategoryRow[]) {
  const nodes = new Map<string, CategoryNode>();
  const root: CategoryNode = { category: parent, children: [] };
  nodes.set(parent.id, root);

  for (const category of descendants) {
    nodes.set(category.id, { category, children: [] });
  }

  for (const category of descendants) {
    const node = nodes.get(category.id);
    const parentNode = category.parentId ? nodes.get(category.parentId) : root;
    if (node) {
      (parentNode ?? root).children.push(node);
    }
  }

  return root;
}

export async function deactivateDescendants(
  category: CategoryDelegate,
  parentId: string,
) {
  let frontier = [parentId];

  while (frontier.length > 0) {
    const children = await category.findMany({
      where: { parentId: { in: frontier }, deletedAt: null },
      select: { id: true },
    });
    const ids = children.map((child) => child.id);
    if (ids.length === 0) {
      return;
    }
    await category.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false },
    });
    frontier = ids;
  }
}
