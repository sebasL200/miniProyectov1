import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategorySummarySwaggerDto {
  @ApiProperty({
    type: String,
    example: '2a9f4a2f-89a4-45d4-885a-a4dcd6d0df12',
    description: 'Category summary UUID.',
  })
  id!: string;

  @ApiProperty({
    type: String,
    example: 'Phones',
    description: 'Category summary name.',
  })
  name!: string;

  @ApiProperty({
    type: String,
    example: 'phones',
    description: 'Category summary slug.',
  })
  slug!: string;
}

export class CreateCategorySwaggerDto {
  @ApiProperty({
    type: String,
    example: 'Electronics',
    description: 'Category display name.',
  })
  name!: string;

  @ApiPropertyOptional({
    type: String,
    example: '2a9f4a2f-89a4-45d4-885a-a4dcd6d0df12',
    description: 'Optional parent category UUID.',
  })
  parentId?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Phones, computers, smart devices, and accessories.',
    description: 'Optional category description.',
  })
  description?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    description: 'Optional category image URL or data URL.',
  })
  imageUrl?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Electronics',
    description: 'Optional meta title.',
  })
  metaTitle?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Shop electronics, devices, computers, and accessories.',
    description: 'Optional meta description.',
  })
  metaDescription?: string;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether the category is active.',
  })
  isActive!: boolean;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether the category is visible in the menu.',
  })
  visibleInMenu!: boolean;
}

export class CreateBatchCategoryItemSwaggerDto extends CreateCategorySwaggerDto {
  @ApiProperty({
    type: String,
    example: 'tmp-1',
    description: 'Client correlation key for the batch item.',
  })
  key!: string;
}

export class CreateBatchCategoriesSwaggerDto {
  @ApiProperty({
    type: () => [CreateBatchCategoryItemSwaggerDto],
    description: 'Categories to create independently.',
  })
  categories!: CreateBatchCategoryItemSwaggerDto[];
}

export class UpdateCategorySwaggerDto {
  @ApiPropertyOptional({
    type: String,
    example: 'Phones',
    description: 'Updated category name.',
  })
  name?: string;

  @ApiPropertyOptional({
    type: String,
    example: '2a9f4a2f-89a4-45d4-885a-a4dcd6d0df12',
    description: 'Updated parent category UUID.',
  })
  parentId?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Smartphones, cases, chargers, and mobile accessories.',
    description: 'Updated description.',
  })
  description?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    description: 'Updated category image URL or data URL.',
  })
  imageUrl?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Phones',
    description: 'Updated meta title.',
  })
  metaTitle?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Shop smartphones, cases, chargers, and mobile accessories.',
    description: 'Updated meta description.',
  })
  metaDescription?: string;

  @ApiPropertyOptional({ type: Boolean, example: true, description: 'Updated active flag.' })
  isActive?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    example: true,
    description: 'Updated menu visibility flag.',
  })
  visibleInMenu?: boolean;
}

export class CategorySwaggerDto {
  @ApiProperty({
    type: String,
    example: '2a9f4a2f-89a4-45d4-885a-a4dcd6d0df12',
    description: 'Category UUID.',
  })
  id!: string;

  @ApiProperty({ type: String, example: 'Phones', description: 'Category display name.' })
  name!: string;

  @ApiProperty({ type: String, example: 'phones', description: 'Normalized category slug.' })
  slug!: string;

  @ApiProperty({ type: Boolean, example: true, description: 'Active flag.' })
  isActive!: boolean;

  @ApiProperty({ type: Boolean, example: true, description: 'Menu visibility flag.' })
  visibleInMenu!: boolean;

  @ApiProperty({
    type: Boolean,
    example: true,
    description: 'Whether the category has linked attributes.',
  })
  hasAttributes!: boolean;

  @ApiPropertyOptional({
    type: () => CategorySummarySwaggerDto,
    description: 'Parent category summary.',
  })
  parent?: CategorySummarySwaggerDto;

  @ApiPropertyOptional({
    type: String,
    example: 'Smartphones, cases, chargers, and mobile accessories.',
    description: 'Category description.',
  })
  description?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...',
    description: 'Category image URL or data URL.',
  })
  imageUrl?: string;

  @ApiPropertyOptional({ type: String, example: 'Phones', description: 'SEO meta title.' })
  metaTitle?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'Shop smartphones, cases, chargers, and mobile accessories.',
    description: 'SEO meta description.',
  })
  metaDescription?: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-04-20T00:00:00.000Z',
    nullable: true,
    description: 'Creation timestamp.',
  })
  createdAt!: Date | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-04-20T00:00:00.000Z',
    nullable: true,
    description: 'Last update timestamp.',
  })
  updatedAt!: Date | null;
}

export class CategoryWithChildrenSwaggerDto extends CategorySwaggerDto {
  @ApiProperty({
    description: 'Recursive child categories.',
    type: () => [CategoryWithChildrenSwaggerDto],
  })
  children!: CategoryWithChildrenSwaggerDto[];
}

export class ListCategoriesDataSwaggerDto {
  @ApiProperty({
    type: () => [CategorySwaggerDto],
    description: 'Category records in the current page.',
  })
  categories!: CategorySwaggerDto[];

  @ApiPropertyOptional({ type: Number, example: 12, description: 'Total matching records.' })
  totalCount?: number;

  @ApiPropertyOptional({ type: Number, example: 1, description: 'Total pages.' })
  totalPages?: number;

  @ApiPropertyOptional({
    type: String,
    example: 'eyJjdXJzb3IiOiJ...',
    description: 'Next cursor token.',
  })
  nextCursor?: string;

  @ApiPropertyOptional({
    type: String,
    example: 'eyJjdXJzb3IiOiJ...',
    description: 'Previous cursor token.',
  })
  prevCursor?: string;
}

export class CategoryBatchSucceededSwaggerDto {
  @ApiProperty({ type: String, example: 'tmp-1', description: 'Client batch key.' })
  key!: string;

  @ApiProperty({
    type: String,
    example: '2a9f4a2f-89a4-45d4-885a-a4dcd6d0df12',
    description: 'Created resource UUID.',
  })
  id!: string;
}

export class CategoryBatchFailedSwaggerDto {
  @ApiProperty({ type: String, example: 'tmp-2', description: 'Client batch key.' })
  key!: string;

  @ApiProperty({
    type: String,
    example: 'category name already exists',
    description: 'Failure reason.',
  })
  reason!: string;
}

export class CreateBatchCategoriesResultSwaggerDto {
  @ApiProperty({ type: String, enum: ['success', 'partial', 'failed'], example: 'partial' })
  status!: 'success' | 'partial' | 'failed';

  @ApiProperty({ type: () => [CategoryBatchSucceededSwaggerDto] })
  succeeded!: CategoryBatchSucceededSwaggerDto[];

  @ApiProperty({ type: () => [CategoryBatchFailedSwaggerDto] })
  failed!: CategoryBatchFailedSwaggerDto[];
}

export class SyncCreatedResultSwaggerDto {
  @ApiProperty({ type: () => [CategoryBatchSucceededSwaggerDto] })
  succeeded!: CategoryBatchSucceededSwaggerDto[];

  @ApiProperty({ type: () => [CategoryBatchFailedSwaggerDto] })
  failed!: CategoryBatchFailedSwaggerDto[];
}

export class SyncUpdatedSuccessSwaggerDto {
  @ApiProperty({
    type: String,
    example: '2a9f4a2f-89a4-45d4-885a-a4dcd6d0df12',
    description: 'Updated category UUID.',
  })
  id!: string;
}

export class SyncUpdatedFailedSwaggerDto {
  @ApiProperty({
    type: String,
    example: '2a9f4a2f-89a4-45d4-885a-a4dcd6d0df12',
    description: 'Failed category UUID.',
  })
  id!: string;

  @ApiProperty({
    type: String,
    example: 'category not found',
    description: 'Failure reason.',
  })
  reason!: string;
}

export class SyncUpdatedResultSwaggerDto {
  @ApiProperty({ type: () => [SyncUpdatedSuccessSwaggerDto] })
  succeeded!: SyncUpdatedSuccessSwaggerDto[];

  @ApiProperty({ type: () => [SyncUpdatedFailedSwaggerDto] })
  failed!: SyncUpdatedFailedSwaggerDto[];
}

export class SyncCategoryChildrenSwaggerDto {
  @ApiProperty({
    type: () => [CreateBatchCategoryItemSwaggerDto],
    description: 'New child categories to create.',
  })
  newCategories!: CreateBatchCategoryItemSwaggerDto[];

  @ApiProperty({
    type: [Object],
    description: 'Existing child categories to update.',
    example: [
      {
        id: '2a9f4a2f-89a4-45d4-885a-a4dcd6d0df12',
        changes: { name: 'Updated' },
      },
    ],
  })
  updateCategories!: Array<{ id: string; changes: UpdateCategorySwaggerDto }>;

  @ApiProperty({
    type: [String],
    description: 'Child category UUIDs to delete.',
    example: ['2a9f4a2f-89a4-45d4-885a-a4dcd6d0df13'],
  })
  deleteCategories!: string[];
}

export class SyncCategoryChildrenResultSwaggerDto {
  @ApiProperty({ type: String, enum: ['success', 'partial', 'failed'], example: 'partial' })
  status!: 'success' | 'partial' | 'failed';

  @ApiProperty({ type: () => SyncCreatedResultSwaggerDto })
  created!: SyncCreatedResultSwaggerDto;

  @ApiProperty({ type: () => SyncUpdatedResultSwaggerDto })
  updated!: SyncUpdatedResultSwaggerDto;

  @ApiProperty({ type: () => SyncUpdatedResultSwaggerDto })
  deleted!: SyncUpdatedResultSwaggerDto;
}

export class CategorySuccessEnvelopeSwaggerDto {
  @ApiProperty({ type: Boolean, example: true, description: 'Success flag.' })
  success!: true;

  @ApiProperty({
    type: String,
    example: 'Category retrieved successfully',
    description: 'Message.',
  })
  message!: string;
}

export class CategoryResponseSwaggerDto extends CategorySuccessEnvelopeSwaggerDto {
  @ApiProperty({
    type: () => CategorySwaggerDto,
    description: 'Category payload.',
  })
  data!: CategorySwaggerDto;
}

export class CategoryWithChildrenResponseSwaggerDto extends CategorySuccessEnvelopeSwaggerDto {
  @ApiProperty({
    type: () => CategoryWithChildrenSwaggerDto,
    description: 'Category payload with nested children.',
  })
  data!: CategoryWithChildrenSwaggerDto;
}

export class ListCategoriesResponseSwaggerDto extends CategorySuccessEnvelopeSwaggerDto {
  @ApiProperty({
    type: () => ListCategoriesDataSwaggerDto,
    description: 'List payload.',
  })
  data!: ListCategoriesDataSwaggerDto;
}

export class CreateBatchCategoriesResponseSwaggerDto extends CategorySuccessEnvelopeSwaggerDto {
  @ApiProperty({
    type: () => CreateBatchCategoriesResultSwaggerDto,
    description: 'Batch creation payload.',
  })
  data!: CreateBatchCategoriesResultSwaggerDto;
}

export class DeleteCategoryDataSwaggerDto {
  @ApiProperty({
    type: () => CategorySwaggerDto,
    description: 'Deleted category.',
  })
  category!: CategorySwaggerDto;
}

export class DeleteCategoryResponseSwaggerDto extends CategorySuccessEnvelopeSwaggerDto {
  @ApiProperty({
    type: () => DeleteCategoryDataSwaggerDto,
    description: 'Delete payload.',
  })
  data!: DeleteCategoryDataSwaggerDto;
}

export class SyncCategoryChildrenResponseSwaggerDto extends CategorySuccessEnvelopeSwaggerDto {
  @ApiProperty({
    type: () => SyncCategoryChildrenResultSwaggerDto,
    description: 'Children sync payload.',
  })
  data!: SyncCategoryChildrenResultSwaggerDto;
}
