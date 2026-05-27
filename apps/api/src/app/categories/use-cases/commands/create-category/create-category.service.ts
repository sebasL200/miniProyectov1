import { Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/interfaces/use-case.interface';
import { PrismaService } from '../../../../prisma/prisma.service';
import { toCategoryDto } from '../../../mappers/categories.mapper';
import {
  CATEGORY_RESPONSE_INCLUDE,
  categoryDelegate,
  generateUniqueSlug,
  getExistingCategory,
  validateBackendCategory,
} from '../../category-use-case.helpers';
import { CreateCategoryInput, CreateCategoryOutput } from './types';

@Injectable()
export class CreateCategoryService
  implements IUseCase<CreateCategoryInput, CreateCategoryOutput>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    const category = categoryDelegate(this.prisma);
    validateBackendCategory(input);

    if (input.parentId) {
      await getExistingCategory(category, input.parentId);
    }

    const slug = await generateUniqueSlug(category, input.name);
    const row = await category.create({
      data: {
        name: input.name,
        slug,
        parentId: input.parentId ?? null,
        description: input.description ?? null,
        imageUrl: input.imageUrl ?? null,
        metaTitle:
          input.metaTitle === undefined || input.metaTitle === ''
            ? input.name
            : input.metaTitle,
        metaDescription: input.metaDescription ?? null,
        isActive: input.isActive,
        visibleInMenu: input.visibleInMenu,
      },
      include: CATEGORY_RESPONSE_INCLUDE,
    });

    return toCategoryDto(row);
  }
}

