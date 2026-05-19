export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface CreatedSucceeded {
  key: string;
  id: string;
}

export interface CreatedFailed {
  key: string;
  reason: string;
}

export type StatusBatchOperation = 'success' | 'partial' | 'failed';

export interface BatchOperationResponse {
  status: StatusBatchOperation;
  succeeded: CreatedSucceeded[];
  failed: CreatedFailed[];
}
