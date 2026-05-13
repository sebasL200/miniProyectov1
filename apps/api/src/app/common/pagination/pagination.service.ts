import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';

@Injectable()
export class PaginationService {
  offsetWindow(page: number | undefined, pageSize: number) {
    const currentPage = Math.max(1, page ?? 1);
    return {
      pageSize,
      offset: (currentPage - 1) * pageSize,
    };
  }

  offsetMetadata(totalCount: number, pageSize: number) {
    return {
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
    };
  }

  fingerprint(filter: Record<string, unknown>): string {
    return createHash('sha256')
      .update(JSON.stringify(filter))
      .digest('base64url')
      .slice(0, 12);
  }

  cursorPosition<K>(opts: {
    after?: string;
    before?: string;
    filterHash: string;
  }): { keys: K; isBackward: boolean } | null {
    const token = opts.after || opts.before;
    if (!token) {
      return null;
    }
    try {
      const decoded = JSON.parse(
        Buffer.from(token, 'base64url').toString('utf8'),
      );
      if (decoded.fh !== opts.filterHash) {
        return null;
      }
      return {
        keys: decoded.keys as K,
        isBackward: Boolean(opts.before),
      };
    } catch {
      return null;
    }
  }

  cursorWindow<T>(
    rows: T[],
    pageSize: number,
    isBackward: boolean,
  ): { rows: T[]; hasMore: boolean } {
    const hasMore = rows.length > pageSize;
    const trimmed = hasMore ? rows.slice(0, pageSize) : rows;
    const ordered = isBackward ? trimmed.reverse() : trimmed;
    return { rows: ordered, hasMore };
  }

  cursorMetadataFromRows<T>(
    rows: T[],
    opts: {
      isBackward: boolean;
      hasAnchor: boolean;
      hasMore: boolean;
      filterHash: string;
      getKeys: (row: T) => Record<string, unknown>;
    },
  ) {
    if (rows.length === 0) {
      return {};
    }

    const encode = (keys: Record<string, unknown>) =>
      Buffer.from(JSON.stringify({ fh: opts.filterHash, keys })).toString(
        'base64url',
      );

    const first = rows[0];
    const last = rows[rows.length - 1];

    const nextCursor = opts.hasMore ? encode(opts.getKeys(last)) : undefined;
    const prevCursor =
      opts.hasAnchor && rows.length > 0
        ? encode(opts.getKeys(first))
        : undefined;

    return { nextCursor, prevCursor };
  }
}
