import { BadRequestException, Injectable } from '@nestjs/common';
import { IUseCase } from '../../../../common/interfaces/use-case.interface';
import { PrismaService } from '../../../../prisma/prisma.service';
import { toCategoryDto } from '../../../mappers/categories.mapper';
import {
  CATEGORY_RESPONSE_INCLUDE,
  CategoryDelegate,
  categoryDelegate,
  deactivateDescendants,
  generateUniqueSlug,
  getDescendants,
  getExistingCategory,
  validateBackendCategory,
} from '../../category-use-case.helpers';
import { UpdateCategoryInput, UpdateCategoryOutput } from './types';

@Injectable()
export class UpdateCategoryService
  implements IUseCase<UpdateCategoryInput, UpdateCategoryOutput>
{
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const category = categoryDelegate(this.prisma);
    const current = await getExistingCategory(category, input.id);
    const merged = {
      name: input.changes.name ?? current.name,
      parentId:
        input.changes.parentId !== undefined
          ? input.changes.parentId || null
          : current.parentId,
      description:
        input.changes.description !== undefined
          ? input.changes.description
          : current.description,
      imageUrl:
        input.changes.imageUrl !== undefined
          ? input.changes.imageUrl || null
          : current.imageUrl,
      metaTitle:
        input.changes.metaTitle !== undefined
          ? input.changes.metaTitle
          : current.metaTitle,
      metaDescription:
        input.changes.metaDescription !== undefined
          ? input.changes.metaDescription
          : current.metaDescription,
      isActive: input.changes.isActive ?? current.isActive,
      visibleInMenu: input.changes.visibleInMenu ?? current.visibleInMenu,
    };

    validateBackendCategory(merged);

    if (merged.metaTitle === null || merged.metaTitle === '') {
      merged.metaTitle = merged.name;
    }

    if (input.changes.parentId !== undefined) {
      await this.validateHierarchyChange(
        category,
        input.id,
        input.changes.parentId || null,
      );
    }

    const data: Record<string, unknown> = { ...merged };

    if (
      input.changes.name !== undefined &&
      input.changes.name !== current.name
    ) {
      data.slug = await generateUniqueSlug(
        category,
        input.changes.name,
        input.id,
      );
    }

    if (current.isActive && merged.isActive === false) {
      await deactivateDescendants(category, input.id);
    }

    const row = await category.update({
      where: { id: input.id },
      data,
      include: CATEGORY_RESPONSE_INCLUDE,
    });

    return toCategoryDto(row);
  }

  private async validateHierarchyChange(
    category: CategoryDelegate,
    id: string,
    parentId: string | null,
  ) {
    if (!parentId) {
      return;
    }
    if (id === parentId) {
      throw new BadRequestException('circular reference detected');
    }

    await getExistingCategory(category, parentId);
    const descendants = await getDescendants(category, id);
    if (descendants.some((category) => category.id === parentId)) {
      throw new BadRequestException('circular reference detected');
    }
  }
}

