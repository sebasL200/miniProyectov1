/**
 * Stub mapper – Attributes feature frozen for incremental delivery.
 * Returns a minimal AttributeSummary-compatible object from any attribute-like DTO.
 */

import { AttributeSummary } from '../../../shared/models';

export function attributeToSummary(attribute: {
  id: string;
  name: string;
  slug?: string;
}): AttributeSummary {
  return {
    id: attribute.id,
    name: attribute.name,
    slug: attribute.slug ?? '',
  };
}

