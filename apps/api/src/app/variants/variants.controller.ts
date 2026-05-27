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
import { CreateVariantDto } from '@org/contracts';
import {
  ListVariantsByProductQueryDto,
  ListVariantsQueryDto,
} from '@org/contracts';
import { UpdateVariantDto } from '@org/contracts';
import {
  validateCreateVariantBody,
  validateListVariantsQuery,
  validateListVariantsByProductQuery,
  validateToggleVariantStatusInput,
  validateUpdateVariantBody,
  validateVariantIdParams,
  validateVariantProductParams,
  validateVariantSkuParams,
} from './validations/variants.validation';
import { VariantsService } from './variants.service';

@Controller('variants')
export class VariantsController {
  constructor(private readonly variantsService: VariantsService) {}

  @Post()
  async createVariant(@Body() body: CreateVariantDto) {
    const input = validateCreateVariantBody(body);
    const result = await this.variantsService.createVariant(input);
    return this.success(result, 'Variant created successfully');
  }

  @Get('sku/:sku')
  async getVariantBySku(@Param() params: unknown) {
    const input = validateVariantSkuParams(params);
    const result = await this.variantsService.getVariantBySku(input.sku);
    return this.success(result, 'Variant retrieved successfully');
  }

  @Get()
  async listVariants(@Query() query: ListVariantsQueryDto) {
    const input = validateListVariantsQuery(query);
    const result = await this.variantsService.listVariants(input);
    return this.success(result, 'Variants retrieved successfully');
  }

  @Get('product/:productId')
  async listVariantsByProduct(
    @Param() params: unknown,
    @Query() query: ListVariantsByProductQueryDto,
  ) {
    const route = validateVariantProductParams(params);
    const input = validateListVariantsByProductQuery(query);
    const result = await this.variantsService.listVariantsByProduct(
      route.productId,
      input,
    );
    return this.success(result, 'Variants retrieved successfully');
  }

  @Get(':id')
  async getVariant(@Param() params: unknown) {
    const input = validateVariantIdParams(params);
    const result = await this.variantsService.getVariant(input.id);
    return this.success(result, 'Variant retrieved successfully');
  }

  @Patch(':id')
  async updateVariant(@Param() params: unknown, @Body() body: UpdateVariantDto) {
    const route = validateVariantIdParams(params);
    const input = validateUpdateVariantBody(body);
    const result = await this.variantsService.updateVariant(route.id, input);
    return this.success(result, 'Variant updated successfully');
  }

  @Patch(':id/status')
  async toggleStatus(@Param() params: unknown, @Body() body: unknown) {
    const input = validateToggleVariantStatusInput(params, body);
    const result = await this.variantsService.toggleStatus(input);
    return this.success(result, 'Variant status updated successfully');
  }

  @Delete(':id')
  async deleteVariant(@Param() params: unknown) {
    const input = validateVariantIdParams(params);
    const result = await this.variantsService.deleteVariant(input.id);
    return this.success(result, 'Variant deleted successfully');
  }

  private success<T>(data: T, message: string) {
    return {
      success: true,
      message,
      data,
    };
  }
}



