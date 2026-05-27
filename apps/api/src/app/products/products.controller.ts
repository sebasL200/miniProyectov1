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
import {
  CreateProductDto,
} from '@org/contracts';
import { ListProductsQueryDto } from '@org/contracts';
import { UpdateProductDto } from '@org/contracts';
import { ProductsService } from './products.service';
import {
  validateCreateProductBody,
  validateCreateBatchProductsBody,
  validateListProductsQuery,
  validateProductCategoryParams,
  validateProductParams,
  validateProductSlugParams,
  validateToggleFeaturedInput,
  validateToggleStatusInput,
  validateUpdateProductBody,
} from './validations/products.validation';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async listProducts(@Query() query: ListProductsQueryDto) {
    const input = validateListProductsQuery(query);
    const result = await this.productsService.listProducts(input);
    return this.success(result, 'Products retrieved successfully');
  }

  @Get('slug/:slug')
  async getProductBySlug(@Param() params: unknown) {
    const input = validateProductSlugParams(params);
    const result = await this.productsService.getProductBySlug(input.slug);
    return this.success(result, 'Product retrieved successfully');
  }

  @Get('category/:categoryId')
  async listProductsByCategory(
    @Param() params: unknown,
    @Query() query: ListProductsQueryDto,
  ) {
    const route = validateProductCategoryParams(params);
    const input = validateListProductsQuery(query);
    const result = await this.productsService.listProductsByCategory(
      route.categoryId,
      input,
    );
    return this.success(result, 'Products retrieved successfully');
  }

  @Post()
  async createProduct(@Body() body: CreateProductDto) {
    const input = validateCreateProductBody(body);
    const result = await this.productsService.createProduct(input);
    return this.success(result, 'Product created successfully');
  }

  @Post('batch')
  async createBatchProducts(@Body() body: unknown) {
    const input = validateCreateBatchProductsBody(body);
    const result = await this.productsService.createBatchProducts(input);
    return this.success(result, 'Batch products created successfully');
  }

  @Get(':id')
  async getProduct(@Param() params: unknown) {
    const input = validateProductParams(params);
    const result = await this.productsService.getProduct(input.id);
    return this.success(result, 'Product retrieved successfully');
  }

  @Patch(':id')
  async updateProduct(@Param() params: unknown, @Body() body: UpdateProductDto) {
    const route = validateProductParams(params);
    const input = validateUpdateProductBody(body);
    const result = await this.productsService.updateProduct(route.id, input);
    return this.success(result, 'Product updated successfully');
  }

  @Patch(':id/status')
  async toggleStatus(@Param() params: unknown, @Body() body: unknown) {
    const input = validateToggleStatusInput(params, body);
    const result = await this.productsService.toggleStatus(input);
    return this.success(result, 'Product status updated successfully');
  }

  @Patch(':id/featured')
  async toggleFeatured(@Param() params: unknown, @Body() body: unknown) {
    const input = validateToggleFeaturedInput(params, body);
    const result = await this.productsService.toggleFeatured(input);
    return this.success(result, 'Product featured status updated successfully');
  }

  @Delete(':id')
  async deleteProduct(@Param() params: unknown) {
    const input = validateProductParams(params);
    const result = await this.productsService.deleteProduct(input.id);
    return this.success(result, 'Product deleted successfully');
  }

  private success<T>(data: T, message: string) {
    return {
      success: true,
      message,
      data,
    };
  }
}



