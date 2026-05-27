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
import { BrandsService } from './brands.service';
import { ListBrandsQueryDto } from '@org/contracts';
import {
  validateCreateBatchBody,
  validateCreateBrandBody,
  validateDeleteParams,
  validateGetParams,
  validateListBrandsQuery,
  validateToggleActiveBody,
  validateToggleVisibleBody,
  validateUpdateBrandBody,
} from './validations/brands.validation';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  async listBrands(@Query() query: ListBrandsQueryDto) {
    const input = validateListBrandsQuery(query);
    return this.brandsService.listBrands(input);
  }

  @Post('batch')
  async createBatchBrands(@Body() body: unknown) {
    const input = validateCreateBatchBody(body);
    return this.brandsService.createBatchBrands(input);
  }

  @Post()
  async createBrand(@Body() body: unknown) {
    const input = validateCreateBrandBody(body);
    return this.brandsService.createBrand(input);
  }

  @Get(':id')
  async getBrand(@Param() params: unknown) {
    const input = validateGetParams(params);
    return this.brandsService.getBrand(input.id);
  }

  @Patch(':id')
  async updateBrand(@Param('id') id: string, @Body() body: unknown) {
    const input = validateUpdateBrandBody(body);
    return this.brandsService.updateBrand(id, input);
  }

  @Delete(':id')
  async deleteBrand(@Param() params: unknown) {
    const input = validateDeleteParams(params);
    return this.brandsService.deleteBrand(input.id);
  }

  @Post('active')
  async toggleActiveBrand(@Body() body: unknown) {
    const input = validateToggleActiveBody(body);
    return this.brandsService.toggleActive(input);
  }

  @Post('visiblemenu')
  async toggleVisibleInMenuBrand(@Body() body: unknown) {
    const input = validateToggleVisibleBody(body);
    return this.brandsService.toggleVisibleInMenu(input);
  }
}



