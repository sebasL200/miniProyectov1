import { BadRequestException, Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/interfaces/use-case.interface';
import { PrismaService } from '../../../../prisma/prisma.service';
import { toCategoryDto } from '../../../mappers/categories.mapper';
import {
  CATEGORY_RESPONSE_INCLUDE,
  categoryDelegate,
  getExistingCategory,
} from '../../category-use-case.helpers';
import { DeleteCategoryInput, DeleteCategoryOutput } from './types';

@Injectable()
export class DeleteCategoryService
  implements IUseCase<DeleteCategoryInput, DeleteCategoryOutput>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    const category = categoryDelegate(this.prisma);
    const current = await getExistingCategory(category, input.id);
    const hasChildren = await category.findFirst({
      where: { parentId: input.id, deletedAt: null },
      select: { id: true },
    });

    if (hasChildren) {
      throw new BadRequestException('category has children');
    }

    const row = await category.update({
      where: { id: input.id },
      data: {
        deletedAt: new Date(),
        isActive: false,
      },
      include: CATEGORY_RESPONSE_INCLUDE,
    });

    return {
      category: toCategoryDto({
        ...row,
        parent: row.parent ?? current.parent,
      }),
    };
  }
}

