export interface OffsetPagination {
  paginationType?: never;
  page?: number;
  pageSize?: number;
  query?: string;
}

export interface CursorPagination {
  paginationType?: 'cursor';
  query?: string;
  after?: string;
  before?: string;
}

export type PaginationParams = OffsetPagination | CursorPagination;

export interface OffsetResponse {
  totalCount: number;
  totalPages: number;
}

export interface CursorResponse {
  nextCursor: string;
  prevCursor: string;
}
