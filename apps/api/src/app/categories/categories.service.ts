import { Injectable } from '@nestjs/common';
import {
  CreateBatchCategoryDto,
  CreateCategoryDto,
} from '@org/contracts';
import { ListCategoriesQueryDto } from '@org/contracts';
import { SyncCategoryChildrenDto } from '@org/contracts';
import { UpdateCategoryDto } from '@org/contracts';
import { CreateBatchCategoriesService } from './use-cases/commands/create-batch-categories/create-batch-categories.service';
import { CreateCategoryService } from './use-cases/commands/create-category/create-category.service';
import { DeleteCategoryService } from './use-cases/commands/delete-category/delete-category.service';
import { SyncCategoryChildrenService } from './use-cases/commands/sync-category-children/sync-category-children.service';
import { UpdateCategoryService } from './use-cases/commands/update-category/update-category.service';
import { GetCategoryService } from './use-cases/queries/get-category/get-category.service';
import { ListCategoriesService } from './use-cases/queries/list-categories/list-categories.service';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly createCategoryUseCase: CreateCategoryService,
    private readonly createBatchCategoriesUseCase: CreateBatchCategoriesService,
    private readonly listCategoriesUseCase: ListCategoriesService,
    private readonly getCategoryUseCase: GetCategoryService,
    private readonly updateCategoryUseCase: UpdateCategoryService,
    private readonly deleteCategoryUseCase: DeleteCategoryService,
    private readonly syncCategoryChildrenUseCase: SyncCategoryChildrenService,
  ) {}

  createCategory(input: CreateCategoryDto) {
    return this.createCategoryUseCase.execute(input);
  }

  createBatchCategories(input: { categories: CreateBatchCategoryDto[] }) {
    return this.createBatchCategoriesUseCase.execute(input);
  }

  listCategories(input: ListCategoriesQueryDto) {
    return this.listCategoriesUseCase.execute(input);
  }

  getCategory(id: string, include?: 'children') {
    return this.getCategoryUseCase.execute({ id, include });
  }

  updateCategory(id: string, input: UpdateCategoryDto) {
    return this.updateCategoryUseCase.execute({ id, changes: input });
  }

  deleteCategory(id: string) {
    return this.deleteCategoryUseCase.execute({ id });
  }

  syncCategoryChildren(input: SyncCategoryChildrenDto) {
    return this.syncCategoryChildrenUseCase.execute(input);
  }
}


