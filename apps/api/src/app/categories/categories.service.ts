import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationService } from '../common/pagination/pagination.service';
import { CreateBatchCategoryDto, CreateCategoryDto, ListCategoriesQueryDto, SyncCategoryChildrenDto, UpdateCategoryDto, CreateBatchCategoriesResultDto, ListCategoriesResultDto, SyncCategoryChildrenResultDto } from '@org/contracts';
import { CategoryNode, CategoryRow, toCategoryDto, toCategoryWithChildrenDto } from './mappers/categories.mapper';

const DEFAULT_PAGE_SIZE = 25;
const CATEGORY_RESPONSE_INCLUDE = {
  parent: { select: { id: true, name: true, slug: true } },
};

type CategoryDelegate = {
  create(args: unknown): Promise<CategoryRow>;
  findFirst(args: unknown): Promise<CategoryRow | null>;
  findMany(args: unknown): Promise<CategoryRow[]>;
  update(args: unknown): Promise<CategoryRow>;
  updateMany(args: unknown): Promise<unknown>;
  count(args: unknown): Promise<number>;
};

type CategoryCursorKeys = { name: string; id: string };

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationService,
  ) {}

  async createCategory(input: CreateCategoryDto) {
    this.validateBackendCategory(input);
    if (input.parentId) await this.getExistingCategory(input.parentId);
    const slug = await this.generateUniqueSlug(input.name);
    const row = await this.category.create({
      data: {
        name: input.name, slug, parentId: input.parentId ?? null,
        description: input.description ?? null, imageUrl: input.imageUrl ?? null,
        metaTitle: input.metaTitle === undefined || input.metaTitle === '' ? input.name : input.metaTitle,
        metaDescription: input.metaDescription ?? null,
        isActive: input.isActive, visibleInMenu: input.visibleInMenu,
      },
      include: CATEGORY_RESPONSE_INCLUDE,
    });
    return toCategoryDto(row);
  }

  async createBatchCategories(input: { categories: CreateBatchCategoryDto[] }): Promise<CreateBatchCategoriesResultDto> {
    const results = await Promise.all(input.categories.map((c) => this.createBatchItem(c)));
    const succeeded = results.filter((i): i is { key: string; id: string } => 'id' in i);
    const failed = results.filter((i): i is { key: string; reason: string } => 'reason' in i);
    return { succeeded, failed, status: this.resolveBatchStatus(succeeded.length, failed.length) };
  }

  async listCategories(input: ListCategoriesQueryDto): Promise<ListCategoriesResultDto> {
    const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;
    if (input.paginationType === 'cursor') return this.listCategoriesWithCursor(input, pageSize);
    const window = this.pagination.offsetWindow(input.page, pageSize);
    const [rows, totalCount] = await Promise.all([
      this.queryCategories(input, window.pageSize, window.offset),
      this.category.count({ where: this.categoryWhere(input) }),
    ]);
    return { categories: rows.map(toCategoryDto), ...this.pagination.offsetMetadata(totalCount, window.pageSize) };
  }

  async getCategory(id: string, include?: 'children') {
    const category = await this.getExistingCategory(id);
    if (include !== 'children') return toCategoryDto(category);
    const descendants = await this.getDescendants(id);
    const node = this.buildTree(category, descendants);
    return toCategoryWithChildrenDto(node);
  }

  async updateCategory(id: string, input: UpdateCategoryDto) {
    const current = await this.getExistingCategory(id);
    const merged = {
      name: input.name ?? current.name,
      parentId: input.parentId !== undefined ? input.parentId || null : current.parentId,
      description: input.description !== undefined ? input.description : current.description,
      imageUrl: input.imageUrl !== undefined ? input.imageUrl || null : current.imageUrl,
      metaTitle: input.metaTitle !== undefined ? input.metaTitle : current.metaTitle,
      metaDescription: input.metaDescription !== undefined ? input.metaDescription : current.metaDescription,
      isActive: input.isActive ?? current.isActive,
      visibleInMenu: input.visibleInMenu ?? current.visibleInMenu,
    };
    this.validateBackendCategory(merged);
    if (merged.metaTitle === null || merged.metaTitle === '') merged.metaTitle = merged.name;
    if (input.parentId !== undefined) await this.validateHierarchyChange(id, input.parentId || null);
    const data: Record<string, unknown> = { ...merged };
    if (input.name !== undefined && input.name !== current.name) data.slug = await this.generateUniqueSlug(input.name, id);
    if (current.isActive && merged.isActive === false) await this.deactivateDescendants(id);
    const row = await this.category.update({ where: { id }, data, include: CATEGORY_RESPONSE_INCLUDE });
    return toCategoryDto(row);
  }

  async deleteCategory(id: string) {
    const current = await this.getExistingCategory(id);
    const hasChildren = await this.category.findFirst({ where: { parentId: id, deletedAt: null }, select: { id: true } });
    if (hasChildren) throw new BadRequestException('category has children');
    const row = await this.category.update({ where: { id }, data: { deletedAt: new Date(), isActive: false }, include: CATEGORY_RESPONSE_INCLUDE });
    return { category: toCategoryDto({ ...row, parent: row.parent ?? current.parent }) };
  }

  async syncCategoryChildren(input: SyncCategoryChildrenDto): Promise<SyncCategoryChildrenResultDto> {
    await this.getExistingCategory(input.id);
    const [created, updated, deleted] = await Promise.all([
      this.syncCreateAll(input.newCategories, input.id),
      this.syncUpdateAll(input.updateCategories),
      this.syncDeleteAll(input.deleteCategories),
    ]);
    return { status: this.resolveSyncStatus(created, updated, deleted), created, updated, deleted };
  }

  // --- Private helpers ---

  private async listCategoriesWithCursor(input: ListCategoriesQueryDto, pageSize: number): Promise<ListCategoriesResultDto> {
    const filterHash = this.pagination.fingerprint({ parent_id: input.parentId ?? null, root_only: input.rootOnly ?? false, query: input.query ?? null });
    const cursor = this.pagination.cursorPosition<CategoryCursorKeys>({ after: input.after, before: input.before, filterHash });
    const rows = await this.queryCategories(input, pageSize + 1, 0, cursor?.keys.name, cursor?.keys.id, cursor?.isBackward ?? false);
    const window = this.pagination.cursorWindow(rows, pageSize, cursor?.isBackward ?? false);
    return {
      categories: window.rows.map(toCategoryDto),
      ...this.pagination.cursorMetadataFromRows(window.rows, { isBackward: Boolean(cursor?.isBackward), hasAnchor: Boolean(cursor), hasMore: window.hasMore, filterHash, getKeys: (row) => ({ name: row.name, id: row.id }) }),
    };
  }

  private queryCategories(input: ListCategoriesQueryDto, take: number, skip: number, cursorName?: string, cursorId?: string, isBackward = false): Promise<CategoryRow[]> {
    return this.category.findMany({ where: this.categoryWhere(input, cursorName, cursorId, isBackward), include: CATEGORY_RESPONSE_INCLUDE, orderBy: [{ name: isBackward ? 'desc' : 'asc' }, { id: isBackward ? 'desc' : 'asc' }], take, skip });
  }

  private categoryWhere(input: ListCategoriesQueryDto, cursorName?: string, cursorId?: string, isBackward = false) {
    const and: unknown[] = [{ deletedAt: null }];
    if (input.query !== undefined) and.push({ OR: [{ name: { contains: input.query } }, { slug: { contains: input.query } }] });
    if (input.parentId !== undefined) and.push({ parentId: input.parentId });
    else if (input.rootOnly) and.push({ parentId: null });
    if (cursorName !== undefined && cursorId !== undefined) {
      and.push({ OR: isBackward ? [{ name: { lt: cursorName } }, { name: cursorName, id: { lt: cursorId } }] : [{ name: { gt: cursorName } }, { name: cursorName, id: { gt: cursorId } }] });
    }
    return { AND: and };
  }

  private async getExistingCategory(id: string): Promise<CategoryRow> {
    const category = await this.category.findFirst({ where: { id, deletedAt: null }, include: CATEGORY_RESPONSE_INCLUDE });
    if (!category) throw new NotFoundException('category not found');
    return category;
  }

  private async createBatchItem(category: CreateBatchCategoryDto) {
    try { const result = await this.createCategory(category); if (!result) return { key: category.key, reason: 'Failed to create category' }; return { key: category.key, id: result.id }; }
    catch (error) { return { key: category.key, reason: error instanceof Error ? error.message : 'Unknown error' }; }
  }

  private async syncCreateAll(items: CreateBatchCategoryDto[], parentId: string) {
    const results = await Promise.all(items.map(async (item) => { try { const r = await this.createCategory({ ...item, parentId }); if (!r) return { key: item.key, reason: 'Failed' }; return { key: item.key, id: r.id }; } catch (e) { return { key: item.key, reason: e instanceof Error ? e.message : 'Unknown error' }; } }));
    return { succeeded: results.filter((i): i is { key: string; id: string } => 'id' in i), failed: results.filter((i): i is { key: string; reason: string } => 'reason' in i) };
  }

  private async syncUpdateAll(items: { id: string; changes: UpdateCategoryDto }[]) {
    const results = await Promise.all(items.map(async (item) => { try { await this.updateCategory(item.id, item.changes); return { id: item.id }; } catch (e) { return { id: item.id, reason: e instanceof Error ? e.message : 'Unknown error' }; } }));
    return { succeeded: results.filter((i): i is { id: string } => !('reason' in i)), failed: results.filter((i): i is { id: string; reason: string } => 'reason' in i) };
  }

  private async syncDeleteAll(ids: string[]) {
    const results = await Promise.all(ids.map(async (id) => { try { const r = await this.deleteCategory(id); return { id: r.category?.id ?? id }; } catch (e) { return { id, reason: e instanceof Error ? e.message : 'Unknown error' }; } }));
    return { succeeded: results.filter((i): i is { id: string } => !('reason' in i)), failed: results.filter((i): i is { id: string; reason: string } => 'reason' in i) };
  }

  private resolveBatchStatus(s: number, f: number) { if (f === 0) return 'success' as const; if (s === 0) return 'failed' as const; return 'partial' as const; }

  private resolveSyncStatus(c: { succeeded: unknown[]; failed: unknown[] }, u: { succeeded: unknown[]; failed: unknown[] }, d: { succeeded: unknown[]; failed: unknown[] }): SyncCategoryChildrenResultDto['status'] {
    const f = c.failed.length + u.failed.length + d.failed.length;
    const s = c.succeeded.length + u.succeeded.length + d.succeeded.length;
    if (f === 0) return 'success'; if (s === 0) return 'failed'; return 'partial';
  }

  private async generateUniqueSlug(value: string, exceptId?: string) {
    const slug = this.slugify(value);
    if (!slug) throw new BadRequestException('category slug source is invalid');
    const existing = await this.category.findFirst({ where: { slug, deletedAt: null, ...(exceptId ? { id: { not: exceptId } } : {}) }, select: { id: true } });
    if (existing) throw new ConflictException('slug already exists');
    return slug;
  }

  private slugify(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }

  private validateBackendCategory(input: { name: string; description?: string | null; imageUrl?: string | null; metaTitle?: string | null; metaDescription?: string | null }) {
    const name = input.name.trim();
    if (name.length < 3 || name.length > 100) throw new BadRequestException('validation error: name must be between 3 and 100 characters');
    if (input.description && input.description.length > 300) throw new BadRequestException('validation error: description must be at most 300 characters');
    if (input.metaTitle && input.metaTitle.length > 100) throw new BadRequestException('validation error: meta_title must be at most 100 characters');
    if (input.metaDescription && input.metaDescription.length > 160) throw new BadRequestException('validation error: meta_description must be at most 160 characters');
  }

  private async validateHierarchyChange(id: string, parentId: string | null) {
    if (!parentId) return;
    if (id === parentId) throw new BadRequestException('circular reference detected');
    await this.getExistingCategory(parentId);
    const descendants = await this.getDescendants(id);
    if (descendants.some((c) => c.id === parentId)) throw new BadRequestException('circular reference detected');
  }

  private async getDescendants(parentId: string): Promise<CategoryRow[]> {
    const descendants: CategoryRow[] = [];
    let frontier = [parentId];
    while (frontier.length > 0) {
      const children = await this.category.findMany({ where: { parentId: { in: frontier }, deletedAt: null }, include: CATEGORY_RESPONSE_INCLUDE, orderBy: [{ name: 'asc' }, { id: 'asc' }] });
      descendants.push(...children);
      frontier = children.map((c) => c.id);
    }
    return descendants;
  }

  private buildTree(parent: CategoryRow, descendants: CategoryRow[]) {
    const nodes = new Map<string, CategoryNode>();
    const root: CategoryNode = { category: parent, children: [] };
    nodes.set(parent.id, root);
    for (const c of descendants) nodes.set(c.id, { category: c, children: [] });
    for (const c of descendants) { const node = nodes.get(c.id); const parentNode = c.parentId ? nodes.get(c.parentId) : root; if (node) (parentNode ?? root).children.push(node); }
    return root;
  }

  private async deactivateDescendants(parentId: string) {
    let frontier = [parentId];
    while (frontier.length > 0) {
      const children = await this.category.findMany({ where: { parentId: { in: frontier }, deletedAt: null }, select: { id: true } });
      const ids = children.map((c) => c.id);
      if (ids.length === 0) return;
      await this.category.updateMany({ where: { id: { in: ids } }, data: { isActive: false } });
      frontier = ids;
    }
  }

  private get category(): CategoryDelegate {
    return (this.prisma.client as unknown as { category: CategoryDelegate }).category;
  }
}
