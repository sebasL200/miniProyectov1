import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBatchBrandsResultDto } from '@org/contracts';
import { ListBrandsDto } from '@org/contracts';

import {
  CreateBatchBrandDto,
  CreateBrandDto,
} from '@org/contracts';
import { ListBrandsQueryDto } from '@org/contracts';
import {
  ToggleBrandActiveDto,
  ToggleBrandVisibleInMenuDto,
} from '@org/contracts';
import { UpdateBrandDto } from '@org/contracts';
import { isUuid, isValidUrl } from '@org/validations';
import { PaginationService } from '../common/pagination/pagination.service';
import { BrandRow, toBrandDto } from './mappers/brands.mapper';

const DEFAULT_PAGE_SIZE = 25;

type BrandWhereInput = Record<string, unknown>;
type BrandCursorKeys = { name: string; id: string };
type BrandUpdateData = {
  name?: string;
  description?: string;
  isActive?: boolean;
  logoUrl?: string;
  website?: string;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  visibleInMenu?: boolean;
  updatedAt: Date;
};

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pagination: PaginationService,
  ) {}

  async createBrand(input: CreateBrandDto) {
    try {
      this.validateBackendCreate(input);

      const metaTitle =
        input.metaTitle === undefined || input.metaTitle === ''
          ? input.name
          : input.metaTitle;
      const slug = await this.generateUniqueSlug(input.name);

      const row = await this.prisma.brand.create({
        data: {
          name: input.name,
          description: input.description ?? null,
          slug,
          logoUrl: input.logoUrl,
          isActive: input.isActive,
          visibleInMenu: input.visibleInMenu,
          website: input.website ?? null,
          metaTitle,
          metaDescription: input.metaDescription,
        },
      });

      return toBrandDto(row);
    } catch (error) {
      throw this.rawCreateError(error);
    }
  }

  async createBatchBrands(input: { brands: CreateBatchBrandDto[] }) {
    const results = await Promise.all(
      input.brands.map(async (brand) => this.createBatchItem(brand)),
    );
    const succeeded = results.filter(
      (item): item is { key: string; id: string } => 'id' in item,
    );
    const failed = results.filter(
      (item): item is { key: string; reason: string } => 'reason' in item,
    );

    const status: CreateBatchBrandsResultDto['status'] =
      failed.length === 0
        ? 'success'
        : succeeded.length === 0
          ? 'failed'
          : 'partial';

    return { succeeded, failed, status };
  }

  async listBrands(input: ListBrandsQueryDto): Promise<ListBrandsDto> {
    const pageSize = input.pageSize ?? DEFAULT_PAGE_SIZE;

    if (input.paginationType === 'cursor') {
      return this.listBrandsWithCursor(input, pageSize);
    }

    const window = this.pagination.offsetWindow(input.page, pageSize);
    const [rows, totalCount] = await Promise.all([
      this.queryBrands(input, window.pageSize, window.offset),
      this.countBrands(input),
    ]);

    return {
      brands: rows.map(toBrandDto),
      ...this.pagination.offsetMetadata(totalCount, window.pageSize),
    };
  }

  async getBrand(id: string) {
    const brand = await this.getExistingBrand(id);
    return toBrandDto(brand);
  }

  async updateBrand(id: string, input: UpdateBrandDto) {
    const current = await this.getExistingBrand(id);
    const data = this.toBrandUpdateData(input);

    if (input.slug != null) {
      data.slug = await this.generateUniqueSlug(input.slug, id);
    } else if (input.name != null && input.name !== current.name) {
      data.slug = await this.generateUniqueSlug(input.name, id);
    }

    this.validateBackendUpdate(data);

    try {
      const row = await this.prisma.brand.update({
        where: { id },
        data,
      });
      return toBrandDto(row);
    } catch (error) {
      if (this.isRecordNotFound(error)) {
        throw new NotFoundException('brand not found');
      }
      if (this.isUniqueFailure(error)) {
        throw new ConflictException('brand slug already exists');
      }
      throw error;
    }
  }

  async deleteBrand(id: string): Promise<boolean> {
    const current = await this.getBrandById(id);

    if (!current) {
      return false;
    }

    await this.prisma.brand.update({
      where: { id },
      data: {
        isActive: false,
        visibleInMenu: false,
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return true;
  }

  async toggleActive(input: ToggleBrandActiveDto): Promise<boolean> {
    const current = await this.getExistingBrand(input.id);

    if (current.isActive === input.isActive) {
      return true;
    }

    await this.prisma.brand.update({
      where: { id: input.id },
      data: {
        isActive: input.isActive,
        updatedAt: new Date(),
      },
    });

    return true;
  }

  async toggleVisibleInMenu(
    input: ToggleBrandVisibleInMenuDto,
  ): Promise<boolean> {
    const current = await this.getExistingBrand(input.id);

    if (current.visibleInMenu === input.visibleInMenu) {
      return true;
    }

    await this.prisma.brand.update({
      where: { id: input.id },
      data: {
        visibleInMenu: input.visibleInMenu,
        updatedAt: new Date(),
      },
    });

    return true;
  }

  private async createBatchItem(brand: CreateBatchBrandDto) {
    try {
      const result = await this.createBrand(brand);
      if (!result) {
        return { key: brand.key, reason: 'Failed to create brand' };
      }
      return { key: brand.key, id: result.id };
    } catch (error) {
      return {
        key: brand.key,
        reason: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async listBrandsWithCursor(
    input: ListBrandsQueryDto,
    pageSize: number,
  ): Promise<ListBrandsDto> {
    const filterHash = this.fingerprint(input);
    const cursor = this.pagination.cursorPosition<BrandCursorKeys>({
      after: input.after,
      before: input.before,
      filterHash,
    });
    const rows = await this.queryBrands(
      input,
      pageSize + 1,
      0,
      cursor?.keys.name,
      cursor?.keys.id,
      cursor?.isBackward ?? false,
    );
    const window = this.pagination.cursorWindow(
      rows,
      pageSize,
      cursor?.isBackward ?? false,
    );

    return {
      brands: window.rows.map(toBrandDto),
      ...this.pagination.cursorMetadataFromRows(window.rows, {
        isBackward: Boolean(cursor?.isBackward),
        hasAnchor: Boolean(cursor),
        hasMore: window.hasMore,
        filterHash,
        getKeys: (row) => ({ name: row.name, id: row.id }),
      }),
    };
  }

  private async queryBrands(
    input: ListBrandsQueryDto,
    limit: number,
    offset: number,
    cursorName?: string,
    cursorId?: string,
    isBackward = false,
  ): Promise<BrandRow[]> {
    return this.prisma.brand.findMany({
      where: this.brandWhere(input, cursorName, cursorId, isBackward),
      orderBy: [
        { name: isBackward ? 'desc' : 'asc' },
        { id: isBackward ? 'desc' : 'asc' },
      ],
      take: limit,
      skip: offset,
    });
  }

  private async countBrands(input: ListBrandsQueryDto): Promise<number> {
    return this.prisma.brand.count({
      where: this.brandWhere(input),
    });
  }

  private brandWhere(
    input: ListBrandsQueryDto,
    cursorName?: string,
    cursorId?: string,
    isBackward = false,
  ): BrandWhereInput {
    const and: BrandWhereInput[] = [{ deletedAt: null }];

    if (input.name !== undefined) {
      and.push({ name: { contains: input.name, mode: 'insensitive' } });
    }
    if (input.metaTitle !== undefined) {
      and.push({
        metaTitle: { contains: input.metaTitle, mode: 'insensitive' },
      });
    }
    if (input.isActive === true) {
      and.push({ isActive: true });
    }
    if (input.website !== undefined) {
      and.push({ website: { contains: input.website, mode: 'insensitive' } });
    }
    if (input.slug !== undefined) {
      and.push({ slug: { contains: input.slug, mode: 'insensitive' } });
    }
    if (cursorName !== undefined && cursorId !== undefined) {
      and.push({
        OR: isBackward
          ? [
              { name: { lt: cursorName } },
              { name: cursorName, id: { lt: cursorId } },
            ]
          : [
              { name: { gt: cursorName } },
              { name: cursorName, id: { gt: cursorId } },
            ],
      });
    }

    return { AND: and };
  }

  private async getExistingBrand(id: string): Promise<BrandRow> {
    const brand = await this.getBrandById(id);

    if (!brand) {
      throw new NotFoundException('brand not found');
    }

    return brand;
  }

  private async getBrandById(id: string): Promise<BrandRow | null> {
    if (!isUuid(id)) {
      return null;
    }

    return this.prisma.brand.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  private async slugExists(slug: string, exceptId?: string): Promise<boolean> {
    const existing = await this.prisma.brand.findFirst({
      where: {
        slug,
        deletedAt: null,
        ...(exceptId ? { id: { not: exceptId } } : {}),
      },
      select: { id: true },
    });

    return Boolean(existing);
  }

  private async generateUniqueSlug(
    value: string,
    exceptId?: string,
  ): Promise<string> {
    const slug = this.slugify(value);

    if (!slug) {
      throw new ConflictException(
        'input cannot be normalized into a valid slug',
      );
    }

    if (await this.slugExists(slug, exceptId)) {
      throw new ConflictException('brand slug already exists');
    }

    return slug;
  }

  private slugify(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private validateBackendCreate(input: CreateBrandDto) {
    const message = this.validateBackendBrand({
      name: input.name,
      description: input.description,
      logoUrl: input.logoUrl,
      website: input.website,
      metaTitle: input.metaTitle,
      metaDescription: input.metaDescription,
    });

    if (message) {
      throw new Error(`validation error: ${message}`);
    }
  }

  private validateBackendUpdate(input: {
    name?: string;
    description?: string | null;
    logoUrl?: string;
    website?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    slug?: string;
  }) {
    if (input.name !== undefined && input.name.length > 100) {
      throw new BadRequestException('name must be at most 100 characters');
    }
    if (input.description && input.description.length > 500) {
      throw new BadRequestException(
        'description must be at most 500 characters',
      );
    }
    if (input.logoUrl && !isValidUrl(input.logoUrl)) {
      throw new BadRequestException('logo_url must be a valid URL');
    }
    if (
      input.website !== undefined &&
      input.website !== null &&
      input.website !== '' &&
      !isValidUrl(input.website)
    ) {
      throw new BadRequestException('website must be a valid URL');
    }
    if (input.metaTitle && input.metaTitle.length > 100) {
      throw new BadRequestException(
        'meta_title must be at most 100 characters',
      );
    }
    if (input.metaDescription && input.metaDescription.length > 160) {
      throw new BadRequestException(
        'meta_description must be at most 160 characters',
      );
    }
  }

  private toBrandUpdateData(input: UpdateBrandDto): BrandUpdateData {
    const data: BrandUpdateData = { updatedAt: new Date() };

    this.assignDefined(data, 'name', input.name);
    this.assignDefined(data, 'description', input.description);
    this.assignDefined(data, 'isActive', input.isActive);
    this.assignDefined(data, 'logoUrl', input.logoUrl);
    this.assignDefined(data, 'website', input.website);
    this.assignDefined(data, 'metaTitle', input.metaTitle);
    this.assignDefined(data, 'metaDescription', input.metaDescription);
    this.assignDefined(data, 'visibleInMenu', input.visibleInMenu);

    return data;
  }

  private assignDefined<T extends object, K extends keyof T>(
    target: T,
    key: K,
    value: T[K] | null | undefined,
  ) {
    if (value !== undefined && value !== null) {
      target[key] = value;
    }
  }

  private validateBackendBrand(input: {
    name?: string;
    description?: string | null;
    logoUrl?: string;
    website?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
  }): string | null {
    if (input.name !== undefined && input.name === '') {
      return 'name is required';
    }
    if (input.name !== undefined && input.name.length > 100) {
      return 'name must be at most 100 characters';
    }
    if (input.description && input.description.length > 500) {
      return 'description must be at most 500 characters';
    }
    if (input.logoUrl !== undefined && input.logoUrl === '') {
      return 'logo_url is required';
    }
    if (input.logoUrl && !isValidUrl(input.logoUrl)) {
      return 'logo_url must be a valid URL';
    }
    if (input.website !== undefined && input.website !== null) {
      if (input.website !== '' && !isValidUrl(input.website)) {
        return 'website must be a valid URL';
      }
    }
    if (input.metaTitle && input.metaTitle.length > 100) {
      return 'meta_title must be at most 100 characters';
    }
    if (input.metaDescription && input.metaDescription.length > 160) {
      return 'meta_description must be at most 160 characters';
    }
    return null;
  }

  private rawCreateError(error: unknown) {
    if (error instanceof ConflictException) {
      return new Error(error.message);
    }
    if (this.isUniqueFailure(error)) {
      return new Error('brand slug already exists');
    }
    if (error instanceof Error) {
      return error;
    }
    return new Error('Internal Server Error');
  }

  private fingerprint(input: ListBrandsQueryDto): string {
    return this.pagination.fingerprint({
      is_active: input.isActive ?? false,
      meta_title: input.metaTitle ?? null,
      name: input.name ?? null,
      slug: input.slug ?? null,
      web_site: input.website ?? null,
    });
  }

  private isUniqueFailure(error: unknown): boolean {
    return (
      this.errorCode(error) === 'P2002' ||
      (error instanceof Error && error.message.includes('unique'))
    );
  }

  private isRecordNotFound(error: unknown): boolean {
    return this.errorCode(error) === 'P2025';
  }

  private errorCode(error: unknown): string | undefined {
    return typeof error === 'object' && error !== null && 'code' in error
      ? String((error as { code?: unknown }).code)
      : undefined;
  }
}


