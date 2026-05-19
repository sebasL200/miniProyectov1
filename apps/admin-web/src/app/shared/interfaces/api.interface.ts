export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export type PaginationType = 'offset' | 'cursor' | 'none';

// ─── Params ───────────────────────────────────────────────

export interface BaseSearchParams {
  paginationType: PaginationType;
  query: string;
  exclude?: string;
}

export interface OffsetPaginationParams extends BaseSearchParams {
  paginationType: 'offset';
  page: number;
  pageSize: number;
}

export interface CursorPaginationParams extends BaseSearchParams {
  paginationType: 'cursor';
  before?: string | null;
  after?: string | null;
  pageSize: number;
}

export interface NoPaginationParams extends BaseSearchParams {
  paginationType: 'none';
}

export type SearchParams =
  | OffsetPaginationParams
  | CursorPaginationParams
  | NoPaginationParams;

// ─── Responses ────────────────────────────────────────────

export type OffsetPaginatedData<K extends string, T> = Record<K, T[]> & {
  totalCount: number;
  totalPages: number;
};

export type CursorPaginatedData<K extends string, T> = Record<K, T[]> & {
  nextCursor: string | null;
  prevCursor: string | null;
};

export type NonPaginatedData<K extends string, T> = Record<K, T[]>;

export type OffsetPaginatedResponse<K extends string, T> = ApiResponse<
  OffsetPaginatedData<K, T>
>;
export type CursorPaginatedResponse<K extends string, T> = ApiResponse<
  CursorPaginatedData<K, T>
>;
export type NonPaginatedResponse<K extends string, T> = ApiResponse<
  NonPaginatedData<K, T>
>;

export type PaginatedResponse<K extends string, T> =
  | OffsetPaginatedResponse<K, T>
  | CursorPaginatedResponse<K, T>
  | NonPaginatedResponse<K, T>;

// ─── Batch ────────────────────────────────────────────────

export type BatchStatus = 'success' | 'partial' | 'failed';

export type BatchSucceeded<
  TSucceeded extends Record<string, unknown> = { id: string },
> = {
  key: string;
} & TSucceeded;

export interface BatchFailed {
  key: string;
  reason: string;
}

export interface BatchData<
  TSucceeded extends Record<string, unknown> = { id: string },
> {
  status: BatchStatus;
  succeeded: BatchSucceeded<TSucceeded>[];
  failed: BatchFailed[];
}

export interface BatchOperation<TSucceeded> {
  succeeded: TSucceeded[];
  failed: BatchFailed[];
}

export type BatchResponse<
  TSucceeded extends Record<string, unknown> = { id: string },
> = ApiResponse<BatchData<TSucceeded>>;
