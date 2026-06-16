import { Attribute } from "@shared/models";

export type AttributeProductVariantSummary = Pick<Attribute, 'id' | 'name' | 'slug' | 'isRequired'>;
