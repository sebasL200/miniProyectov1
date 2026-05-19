import { AttributeSummary } from './attribute.model';

export interface ProductVariantProductSummary {
  id: string;
  name: string;
  slug: string;
}

export interface ProductVariantDimensions {
  width?: string;
  height?: string;
  length?: string;
  weight?: string;
}

export interface ProductVariantAttributeValue {
  attribute: AttributeSummary;
  value: string;
}

export interface ProductVariant {
  id: string;
  product: ProductVariantProductSummary;
  sku: string;
  price?: number;
  stockQuantity: number;
  minimumStock: number;
  barcodeGtin?: string;
  descriptionHtml?: string;
  offerPrice?: number;
  offerStart?: Date;
  offerEnd?: Date;
  dimensions: ProductVariantDimensions;
  isActive: boolean;
  imageUrls: string[];
  directAttributes: AttributeSummary[];
  attributes: AttributeSummary[];
  attributeValues: ProductVariantAttributeValue[];
  createdAt: Date | null;
  updatedAt: Date | null;
}
