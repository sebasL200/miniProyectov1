import { EntityData, PersistedRecord } from '../../../shared/interfaces/entity-record.interface';
import { Brand } from '../../../shared/models/brand.model';

export type BrandPersistedRecord = PersistedRecord<Brand & EntityData>;
