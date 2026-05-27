import { VariantDto } from './variant.dto.js';

export class VariantsOffsetPaginationDto {
  currentPage!: number;
  totalPages!: number;
  totalCount!: number;
}

export class VariantsCursorPaginationDto {
  nextCursor?: string;
  prevCursor?: string;
}

export class VariantsPaginationDto {
  offset?: VariantsOffsetPaginationDto;
  cursor?: VariantsCursorPaginationDto;
}

export class ListVariantsByProductResultDto {
  variants!: VariantDto[];
  pagination!: VariantsPaginationDto;
}

export class ListVariantsResultDto extends ListVariantsByProductResultDto {}
