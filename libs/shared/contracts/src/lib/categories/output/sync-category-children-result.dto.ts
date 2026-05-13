export class SyncCategoryChildrenResultDto {
  status!: 'success' | 'partial' | 'failed';
  created!: {
    succeeded: { key: string; id: string }[];
    failed: { key: string; reason: string }[];
  };
  updated!: {
    succeeded: { id: string }[];
    failed: { id: string; reason: string }[];
  };
  deleted!: {
    succeeded: { id: string }[];
    failed: { id: string; reason: string }[];
  };
}
