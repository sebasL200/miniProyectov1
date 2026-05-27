export interface EntitySummaryDto {
  id: string;
  name: string;
  slug: string;
}

export interface CategorySummaryDto extends EntitySummaryDto {}

export interface BrandSummaryDto extends EntitySummaryDto {}

export interface AttributeSummaryDto extends EntitySummaryDto {}

export interface ProductSummaryDto extends EntitySummaryDto {}

export interface VariantReferenceSummaryDto {
  id: string;
  sku: string;
}

export interface AttributeValueReferenceSummaryDto {
  id: string;
}

export interface MexicoStateCatalogSummaryDto {
  id: string;
  code: string;
  name: string;
}

export interface MexicoMunicipalityCatalogSummaryDto {
  id: string;
  stateId: string;
  code?: string;
  name: string;
}

export interface TaxRegimeCatalogSummaryDto {
  code: string;
  name: string;
  personType?: string;
}

export interface UserRoleSummaryDto {
  id: string;
  code: string;
  name: string;
}

export interface AppModuleAccessSummaryDto {
  id: string;
  code: string;
  name: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
}
