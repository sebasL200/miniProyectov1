import { CategoryFormData } from '../../components/forms/category-form/types';
import { DraftRecord, EntityData } from '../../../../shared/interfaces/entity-record.interface';

export type CategoryDraft = DraftRecord<CategoryFormData & EntityData>;
