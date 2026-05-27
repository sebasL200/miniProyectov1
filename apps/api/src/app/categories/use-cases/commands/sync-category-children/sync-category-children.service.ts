import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/interfaces/use-case.interface';
import { UpdateCategoryDto } from '@org/contracts';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateBatchCategoryDto } from '@org/contracts';
import { CreateCategoryService } from '../create-category/create-category.service';
import { DeleteCategoryService } from '../delete-category/delete-category.service';
import { UpdateCategoryService } from '../update-category/update-category.service';
import {
  categoryDelegate,
  getExistingCategory,
} from '../../category-use-case.helpers';
import { SyncCategoryChildrenInput, SyncCategoryChildrenOutput } from './types';

@Injectable()
export class SyncCategoryChildrenService
  implements IUseCase<SyncCategoryChildrenInput, SyncCategoryChildrenOutput>
{
  constructor(
    private readonly prisma: PrismaService,
    private readonly createCategory: CreateCategoryService,
    private readonly updateCategory: UpdateCategoryService,
    private readonly deleteCategory: DeleteCategoryService,
  ) {}

  async execute(
    input: SyncCategoryChildrenInput,
  ): Promise<SyncCategoryChildrenOutput> {
    const category = categoryDelegate(this.prisma);
    await getExistingCategory(category, input.id);

    const [created, updated, deleted] = await Promise.all([
      this.syncCreateAll(input.newCategories, input.id),
      this.syncUpdateAll(input.updateCategories),
      this.syncDeleteAll(input.deleteCategories),
    ]);

    return {
      status: this.resolveSyncStatus(created, updated, deleted),
      created,
      updated,
      deleted,
    };
  }

  private async syncCreateAll(
    items: CreateBatchCategoryDto[],
    parentId: string,
  ) {
    const results = await Promise.all(
      items.map(async (item) => {
        try {
          const result = await this.createCategory.execute({
            ...item,
            parentId,
          });
          if (!result) {
            return { key: item.key, reason: 'Failed to create category' };
          }
          return { key: item.key, id: result.id };
        } catch (error) {
          return {
            key: item.key,
            reason: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),
    );

    return {
      succeeded: results.filter(
        (item): item is { key: string; id: string } => 'id' in item,
      ),
      failed: results.filter(
        (item): item is { key: string; reason: string } => 'reason' in item,
      ),
    };
  }

  private async syncUpdateAll(
    items: { id: string; changes: UpdateCategoryDto }[],
  ) {
    const results = await Promise.all(
      items.map(async (item) => {
        try {
          await this.updateCategory.execute({
            id: item.id,
            changes: item.changes,
          });
          return { id: item.id };
        } catch (error) {
          return {
            id: item.id,
            reason: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),
    );

    return {
      succeeded: results.filter(
        (item): item is { id: string } => !('reason' in item),
      ),
      failed: results.filter(
        (item): item is { id: string; reason: string } => 'reason' in item,
      ),
    };
  }

  private async syncDeleteAll(ids: string[]) {
    const results = await Promise.all(
      ids.map(async (id) => {
        try {
          const result = await this.deleteCategory.execute({ id });
          return { id: result.category?.id ?? id };
        } catch (error) {
          return {
            id,
            reason: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }),
    );

    return {
      succeeded: results.filter(
        (item): item is { id: string } => !('reason' in item),
      ),
      failed: results.filter(
        (item): item is { id: string; reason: string } => 'reason' in item,
      ),
    };
  }

  private resolveSyncStatus(
    created: { succeeded: unknown[]; failed: unknown[] },
    updated: { succeeded: unknown[]; failed: unknown[] },
    deleted: { succeeded: unknown[]; failed: unknown[] },
  ): SyncCategoryChildrenOutput['status'] {
    const failures =
      created.failed.length + updated.failed.length + deleted.failed.length;
    const successes =
      created.succeeded.length +
      updated.succeeded.length +
      deleted.succeeded.length;

    if (failures === 0) {
      return 'success';
    }
    if (successes === 0) {
      return 'failed';
    }
    return 'partial';
  }
}


