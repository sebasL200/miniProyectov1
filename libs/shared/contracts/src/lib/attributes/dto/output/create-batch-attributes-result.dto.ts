export type CreateBatchAttributesStatus = 'success' | 'partial' | 'failed';

export interface CreateBatchAttributesResultDto {
  status: CreateBatchAttributesStatus;
  succeeded: Array<{ key: string; id: string }>;
  failed: Array<{ key: string; reason: string }>;
}
