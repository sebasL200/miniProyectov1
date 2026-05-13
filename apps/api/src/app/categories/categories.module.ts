import { Module } from '@nestjs/common';
import { PaginationService } from '../common/pagination/pagination.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService, PaginationService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
