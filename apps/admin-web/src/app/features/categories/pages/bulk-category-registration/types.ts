import { CategoryFormData } from "@categories/components/forms/category-form/types";
import { DraftRecord, EntityData } from "@shared/interfaces";

export type CategoryDraft = DraftRecord<CategoryFormData & EntityData>;
