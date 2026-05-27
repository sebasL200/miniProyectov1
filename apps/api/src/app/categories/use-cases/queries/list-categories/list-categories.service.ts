import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/interfaces/use-case.interface';
import { PaginationService } from '../../../../common/pagination/pagination.service';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ListCategoriesQueryDto } from '@org/contracts';
import { CategoryRow, toCategoryDto } from '../../../mappers/categories.mapper';
import {
  CATEGORY_RESPONSE_INCLUDE,
  CategoryDelegate,
  categoryDelegate,
} from '../../category-use-case.helpers';
import { ListCategoriesInput, ListCategoriesOutput } from './types';

const DEFAULT_PAGE_SIZE = 25;

type CategoryOrderField = 'name' | 'createdAt' | 'updatedAt';
type CategoryOrderDirection = 'asc' | 'desc';
type CategoryCursorKeys = { orderValue: string; id: string };

@Injectable()
export class ListCategoriesService
  implements IUseCase<ListCategoriesInput, ListCategoriesOutput>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationService,
  ) {}

  async execute(input: ListCategoriesInput): Promise<ListCategoriesOutput> {
    const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;
    const category = categoryDelegate(this.prisma);

    if (input.paginationType === 'cursor') {
      return this.listCategoriesWithCursor(category, input, pageSize);
    }

    const window = this.pagination.offsetWindow(input.page, pageSize);
    const [rows, totalCount] = await Promise.all([
      this.queryCategories(category, input, window.pageSize, window.offset),
      category.count({ where: this.categoryWhere(input) }),
    ]);

    return {
      categories: rows.map(toCategoryDto),
      ...this.pagination.offsetMetadata(totalCount, window.pageSize),
    };
  }

  private async listCategoriesWithCursor(
    category: CategoryDelegate,
    input: ListCategoriesQueryDto,
    pageSize: number,
  ): Promise<ListCategoriesOutput> {
    const filterHash = this.pagination.fingerprint({
      parent_id: input.parentId ?? null,
      root_only: input.rootOnly ?? false,
      is_active: input.isActive ?? null,
      order: input.order ?? null,
      query: input.query ?? null,
    });
    const cursor = this.pagination.cursorPosition<CategoryCursorKeys>({
      after: input.after,
      before: input.before,
      filterHash,
    });
    const rows = await this.queryCategories(
      category,
      input,
      pageSize + 1,
      0,
      cursor?.keys.orderValue,
      cursor?.keys.id,
      cursor?.isBackward ?? false,
    );
    const window = this.pagination.cursorWindow(
      rows,
      pageSize,
      cursor?.isBackward ?? false,
    );

    return {
      categories: window.rows.map(toCategoryDto),
      ...this.pagination.cursorMetadataFromRows(window.rows, {
        isBackward: Boolean(cursor?.isBackward),
        hasAnchor: Boolean(cursor),
        hasMore: window.hasMore,
        filterHash,
        getKeys: (row) => ({
          orderValue: this.cursorOrderValue(row, input),
          id: row.id,
        }),
      }),
    };
  }

  private queryCategories(
    category: CategoryDelegate,
    input: ListCategoriesQueryDto,
    take: number,
    skip: number,
    cursorOrderValue?: string,
    cursorId?: string,
    isBackward = false,
  ): Promise<CategoryRow[]> {
    return category.findMany({
      where: this.categoryWhere(input, cursorOrderValue, cursorId, isBackward),
      include: CATEGORY_RESPONSE_INCLUDE,
      orderBy: this.categoryOrderBy(input, isBackward),
      take,
      skip,
    });
  }

  private categoryWhere(
    input: ListCategoriesQueryDto,
    cursorOrderValue?: string,
    cursorId?: string,
    isBackward = false,
  ) {
    const and: unknown[] = [{ deletedAt: null }];

    if (input.query !== undefined) {
      and.push({
        OR: [
          { name: { contains: input.query, mode: 'insensitive' } },
          { slug: { contains: input.query, mode: 'insensitive' } },
        ],
      });
    }

    if (input.parentId !== undefined) {
      and.push({ parentId: input.parentId });
    } else if (input.rootOnly) {
      and.push({ parentId: null });
    }

    if (input.isActive !== undefined) {
      and.push({ isActive: input.isActive });
    }

    if (cursorOrderValue !== undefined && cursorId !== undefined) {
      const field = this.categoryOrderField(input);
      const orderValue = this.coerceCursorOrderValue(field, cursorOrderValue);
      const operator = this.cursorOperator(input, isBackward);

      and.push({
        OR: [
          { [field]: { [operator]: orderValue } },
          { [field]: orderValue, id: { [operator]: cursorId } },
        ],
      });
    }

    return { AND: and };
  }

  private categoryOrderBy(input: ListCategoriesQueryDto, isBackward = false) {
    const field = this.categoryOrderField(input);
    const direction = this.categoryOrderDirection(input);
    const effectiveDirection = isBackward
      ? this.invertDirection(direction)
      : direction;

    return [{ [field]: effectiveDirection }, { id: effectiveDirection }];
  }

  private categoryOrderField(input: ListCategoriesQueryDto): CategoryOrderField {
    if (input.order === 'createdAt' || input.order === '-createdAt') {
      return 'createdAt';
    }

    if (input.order === 'updatedAt' || input.order === '-updatedAt') {
      return 'updatedAt';
    }

    return 'name';
  }

  private categoryOrderDirection(
    input: ListCategoriesQueryDto,
  ): CategoryOrderDirection {
    if (!input.order) {
      return 'asc';
    }

    return input.order.startsWith('-') ? 'asc' : 'desc';
  }

  private invertDirection(
    direction: CategoryOrderDirection,
  ): CategoryOrderDirection {
    return direction === 'asc' ? 'desc' : 'asc';
  }

  private cursorOperator(
    input: ListCategoriesQueryDto,
    isBackward: boolean,
  ): 'gt' | 'lt' {
    const direction = this.categoryOrderDirection(input);
    const moveGreater = direction === 'asc' ? !isBackward : isBackward;

    return moveGreater ? 'gt' : 'lt';
  }

  private cursorOrderValue(
    row: CategoryRow,
    input: ListCategoriesQueryDto,
  ): string {
    const field = this.categoryOrderField(input);
    const value = row[field];

    return value instanceof Date ? value.toISOString() : value;
  }

  private coerceCursorOrderValue(
    field: CategoryOrderField,
    value: string,
  ): string | Date {
    if (field === 'createdAt' || field === 'updatedAt') {
      return new Date(value);
    }

    return value;
  }
}


