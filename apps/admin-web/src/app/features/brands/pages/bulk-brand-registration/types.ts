import { BrandFormData } from '../../components/forms/brand-form/types';
import { DraftRecord, EntityData } from '../../../../shared/interfaces/entity-record.interface';

export type BrandDraft = DraftRecord<BrandFormData & EntityData>;
