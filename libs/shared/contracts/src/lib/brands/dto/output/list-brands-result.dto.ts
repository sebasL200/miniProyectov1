import { BrandDto } from "./brand.dto.js";

export class ListBrandsDto {
  brands!: (BrandDto | null)[];
  totalCount?: number;
  totalPages?: number;
  nextCursor?: string;
  prevCursor?: string;
}