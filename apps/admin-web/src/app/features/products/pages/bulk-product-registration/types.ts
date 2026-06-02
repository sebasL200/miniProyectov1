import { ProductFormData } from '../../components/forms/product-form/types';
import { DraftRecord, EntityData } from '../../../../shared/interfaces';
import { CreateBatchProductDto } from '@org/contracts';


export type ProductDraft = DraftRecord<ProductFormData & EntityData>;
export type BulkSaveProductItem = CreateBatchProductDto;
