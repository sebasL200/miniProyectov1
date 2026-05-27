import type { AttributeSummaryDto } from '../../../common/dto/output/entity-summary.dto.js';

export interface VariantAttributeValueDto {
  attribute: AttributeSummaryDto;
  value: string;
}
