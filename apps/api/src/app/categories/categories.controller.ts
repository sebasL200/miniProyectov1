import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ListCategoriesQueryDto } from '@org/contracts';
import {
  validateCreateBatchBody,
  validateCreateCategoryBody,
  validateDeleteParams,
  validateGetParams,
  validateGetQuery,
  validateListCategoriesQuery,
  validateSyncChildrenInput,
  validateUpdateCategoryBody,
} from './validations/categories.validation';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async listCategories(@Query() query: ListCategoriesQueryDto) {
    const input = validateListCategoriesQuery(query);
    return this.categoriesService.listCategories(input);
  }

  @Post('batch')
  async createBatchCategories(@Body() body: unknown) {
    const input = validateCreateBatchBody(body);
    return this.categoriesService.createBatchCategories(input);
  }

  @Post()
  async createCategory(@Body() body: unknown) {
    const input = validateCreateCategoryBody(body);
    return this.categoriesService.createCategory(input);
  }

  @Get(':id')
  async getCategory(@Param() params: unknown, @Query() query: unknown) {
    const route = validateGetParams(params);
    const parsedQuery = validateGetQuery(query);
    return this.categoriesService.getCategory(route.id, parsedQuery.include);
  }

  @Patch(':id')
  async updateCategory(@Param() params: unknown, @Body() body: unknown) {
    const route = validateGetParams(params);
    const input = validateUpdateCategoryBody(body);
    return this.categoriesService.updateCategory(route.id, input);
  }

  @Delete(':id')
  async deleteCategory(@Param() params: unknown) {
    const input = validateDeleteParams(params);
    return this.categoriesService.deleteCategory(input.id);
  }

  @Patch(':id/children/sync')
  async syncCategoryChildren(@Param() params: unknown, @Body() body: unknown) {
    const input = validateSyncChildrenInput(params, body);
    return this.categoriesService.syncCategoryChildren(input);
  }
}



