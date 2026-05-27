export class VariantPackagingDimensionsDto {
  unit?: string;
  depth?: number;
  width?: number;
  height?: number;
}

export class VariantDimensionsDto {
  width?: string;
  height?: string;
  length?: string;
  weight?: string;
  packaging?: VariantPackagingDimensionsDto;
}
