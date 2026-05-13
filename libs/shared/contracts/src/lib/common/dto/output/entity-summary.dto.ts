export interface EntitySummaryDto {
  id: string;
  name: string;
  slug: string;
}

export interface CategorySummaryDto extends EntitySummaryDto {}
