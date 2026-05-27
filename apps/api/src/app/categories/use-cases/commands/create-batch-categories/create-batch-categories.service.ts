import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/interfaces/use-case.interface';
import { CreateBatchCategoryDto } from '@org/contracts';
import { CreateCategoryService } from '../create-category/create-category.service';
import {
  CreateBatchCategoriesInput,
  CreateBatchCategoriesOutput,
} from './types';

@Injectable()
export class CreateBatchCategoriesService
  implements IUseCase<CreateBatchCategoriesInput, CreateBatchCategoriesOutput>
{
  constructor(private readonly createCategory: CreateCategoryService) {}

  async execute(
    input: CreateBatchCategoriesInput,
  ): Promise<CreateBatchCategoriesOutput> {
    const results = await Promise.all(
      input.categories.map((category) => this.createBatchItem(category)),
    );
    const succeeded = results.filter(
      (item): item is { key: string; id: string } => 'id' in item,
    );
    const failed = results.filter(
      (item): item is { key: string; reason: string } => 'reason' in item,
    );

    return {
      succeeded,
      failed,
      status: this.resolveBatchStatus(succeeded.length, failed.length),
    };
  }

  private async createBatchItem(category: CreateBatchCategoryDto) {
    try {
      const result = await this.createCategory.execute(category);
      if (!result) {
        return { key: category.key, reason: 'Failed to create category' };
      }
      return { key: category.key, id: result.id };
    } catch (error) {
      return {
        key: category.key,
        reason: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private resolveBatchStatus(successCount: number, failureCount: number) {
    if (failureCount === 0) {
      return 'success' as const;
    }
    if (successCount === 0) {
      return 'failed' as const;
    }
    return 'partial' as const;
  }
}


