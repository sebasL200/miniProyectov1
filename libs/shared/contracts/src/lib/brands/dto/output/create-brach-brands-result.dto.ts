export class CreateBatchBrandsResultDto {
  status!: 'success' | 'partial' | 'failed';
  succeeded!: { key: string; id: string }[];
  failed!: { key: string; reason: string }[];
}
