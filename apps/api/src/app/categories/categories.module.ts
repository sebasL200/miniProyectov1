import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaginationService } from '../common/pagination/pagination.service';
import { CategoriesController } from './categories.controller';
import { CompositeCategoriesController } from './composite-categories.controller';
import { CategoriesService } from './categories.service';
import { CreateBatchCategoriesService } from './use-cases/commands/create-batch-categories/create-batch-categories.service';
import { CreateCategoryService } from './use-cases/commands/create-category/create-category.service';
import { DeleteCategoryService } from './use-cases/commands/delete-category/delete-category.service';
import { SyncCategoryChildrenService } from './use-cases/commands/sync-category-children/sync-category-children.service';
import { UpdateCategoryService } from './use-cases/commands/update-category/update-category.service';
import { GetCategoryService } from './use-cases/queries/get-category/get-category.service';
import { ListCategoriesService } from './use-cases/queries/list-categories/list-categories.service';

@Module({
  controllers: [CategoriesController, CompositeCategoriesController],
  providers: [
    CategoriesService,
    CreateCategoryService,
    CreateBatchCategoriesService,
    ListCategoriesService,
    GetCategoryService,
    UpdateCategoryService,
    DeleteCategoryService,
    SyncCategoryChildrenService,
    PrismaService,
    PaginationService,
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
