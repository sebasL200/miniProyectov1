import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AttributesService } from './attributes.service';
import {
  validateCreateAttributeBody,
  validateCreateBatchBody,
  validateDeleteParams,
  validateGetParams,
  validateIfMatch,
  validateListAttributesQuery,
  validateUpdateAttributeBody,
} from './validations/attributes.validation';

@Controller('attributes')
export class AttributesController {
  constructor(private readonly attributesService: AttributesService) {}

  @Get()
  async listAttributes(@Query() query: unknown) {
    const input = validateListAttributesQuery(query);
    const result = await this.attributesService.listAttributes(input);
    return this.success(result, 'Attributes retrieved successfully');
  }

  @Post('batch')
  async createBatchAttributes(@Body() body: unknown) {
    const input = validateCreateBatchBody(body);
    const result = await this.attributesService.createBatchAttributes(input);
    return this.success(result, 'Batch attributes created successfully');
  }

  @Post()
  async createAttribute(@Body() body: unknown) {
    const input = validateCreateAttributeBody(body);
    const result = await this.attributesService.createAttribute(input);
    return this.success(result, 'Attribute created successfully');
  }

  @Get(':id')
  async getAttribute(
    @Param() params: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    const input = validateGetParams(params);
    const result = await this.attributesService.getAttribute(input.id);
    response.setHeader('ETag', `"${result.version}"`);
    return this.success(result.attribute, 'Attribute retrieved successfully');
  }

  @Patch(':id')
  async updateAttribute(
    @Param() params: unknown,
    @Body() body: unknown,
    @Headers('if-match') ifMatch: unknown,
    @Res({ passthrough: true }) response: Response,
  ) {
    const headers = validateIfMatch(ifMatch);
    const parsedBody = validateUpdateAttributeBody(body);
    const route = validateGetParams(params);
    const result = await this.attributesService.updateAttribute(
      route.id,
      parsedBody,
      headers.expectedVersion,
    );
    response.setHeader('ETag', `"${result.version}"`);
    return this.success(result.attribute, 'Attribute updated successfully');
  }

  @Delete(':id')
  async deleteAttribute(@Param() params: unknown) {
    const input = validateDeleteParams(params);
    const result = await this.attributesService.deleteAttribute(input.id);
    return this.success(result, 'Attribute deleted successfully');
  }

  private success<T>(data: T, message: string) {
    return {
      success: true,
      message,
      data,
    };
  }
}


