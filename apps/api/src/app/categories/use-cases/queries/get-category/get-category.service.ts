import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/interfaces/use-case.interface';
import { PrismaService } from '../../../../prisma/prisma.service';
import {
  toCategoryDto,
  toCategoryWithChildrenDto,
} from '../../../mappers/categories.mapper';
import {
  buildTree,
  categoryDelegate,
  getDescendants,
  getExistingCategory,
} from '../../category-use-case.helpers';
import { GetCategoryInput, GetCategoryOutput } from './types';

@Injectable()
export class GetCategoryService
  implements IUseCase<GetCategoryInput, GetCategoryOutput>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
    const category = categoryDelegate(this.prisma);
    const row = await getExistingCategory(category, input.id);

    if (input.include !== 'children') {
      return toCategoryDto(row);
    }

    const descendants = await getDescendants(category, input.id);
    const node = buildTree(row, descendants);
    return toCategoryWithChildrenDto(node);
  }
}

