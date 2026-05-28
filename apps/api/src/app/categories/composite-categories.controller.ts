import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import {
  validateGetParams,
  validateListCategoriesQuery,
} from './validations/categories.validation';

@Controller('composite/categories')
export class CompositeCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async listCategoriesComposite(@Query() query: unknown) {
    const input = validateListCategoriesQuery(query);
    const result = await this.categoriesService.listCategories(input);
    return {
      table: result,
    };
  }

  @Get(':id/children')
  async getCategoryChildrenComposite(@Param() params: unknown) {
    const parsedParams = validateGetParams(params);
    const category = await this.categoriesService.getCategory(
      parsedParams.id,
      'children',
    );
    return {
      category,
    };
  }
}
