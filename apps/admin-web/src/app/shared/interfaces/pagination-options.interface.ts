export interface PaginationOptions {
  showPagination: boolean;
  page: number;
  size: number | undefined;
  total: number;
  pages: number;
}

export const createPagination = ({
  showPagination = false,
  page = 1,
  size,
  total = 0,
  pages = 0,
}: Partial<PaginationOptions>): PaginationOptions => {
  if (
    showPagination &&
    (page === undefined ||
      size === undefined ||
      total === undefined ||
      pages === undefined)
  ) {
    throw new Error(
      'When showPagination is true, page, size and total must be defined',
    );
  }
  return {
    showPagination,
    page,
    size,
    total,
    pages,
  };
};
