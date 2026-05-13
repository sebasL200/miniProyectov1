import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { ListCategoriesQueryDto } from '@org/contracts';
import { validateCreateBatchBody, validateCreateCategoryBody, validateDeleteParams, validateGetParams, validateGetQuery, validateListCategoriesQuery, validateSyncChildrenInput, validateUpdateCategoryBody } from './validations/categories.validation';
import { SuccessResponse } from '../common/interceptors/success-response.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @SuccessResponse('Categories retrieved successfully')
  @Get()
  async listCategories(@Query() query: ListCategoriesQueryDto) {
    const input = validateListCategoriesQuery(query);
    return this.categoriesService.listCategories(input);
  }

  @SuccessResponse('Batch categories created successfully')
  @Post('batch')
  async createBatchCategories(@Body() body: unknown) {
    const input = validateCreateBatchBody(body);
    return this.categoriesService.createBatchCategories(input);
  }

  @SuccessResponse('Category created successfully')
  @Post()
  async createCategory(@Body() body: unknown) {
    const input = validateCreateCategoryBody(body);
    return this.categoriesService.createCategory(input);
  }

  @SuccessResponse('Category retrieved successfully')
  @Get(':id')
  async getCategory(@Param() params: unknown, @Query() query: unknown) {
    const route = validateGetParams(params);
    const parsedQuery = validateGetQuery(query);
    return this.categoriesService.getCategory(route.id, parsedQuery.include);
  }

  @SuccessResponse('Category updated successfully')
  @Patch(':id')
  async updateCategory(@Param() params: unknown, @Body() body: unknown) {
    const route = validateGetParams(params);
    const input = validateUpdateCategoryBody(body);
    return this.categoriesService.updateCategory(route.id, input);
  }

  @SuccessResponse('Category deleted successfully')
  @Delete(':id')
  async deleteCategory(@Param() params: unknown) {
    const input = validateDeleteParams(params);
    return this.categoriesService.deleteCategory(input.id);
  }

  @SuccessResponse('Batch categories synced')
  @Patch(':id/children/sync')
  async syncCategoryChildren(@Param() params: unknown, @Body() body: unknown) {
    const input = validateSyncChildrenInput(params, body);
    return this.categoriesService.syncCategoryChildren(input);
  }
}
