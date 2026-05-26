import { describe, expect, it } from 'vitest';
import { buildSubcategoriesSyncFailureMessage } from './subcategories-sync-result-message.util';
import {
  SyncBatchOperation,
  SyncCreatedItem,
  SyncDeletedItem,
  SyncUpdatedItem,
} from './types';

describe('buildSubcategoriesSyncFailureMessage', () => {
  const emptyCreated: SyncBatchOperation<SyncCreatedItem> = {
    succeeded: [],
    failed: [],
  };
  const emptyUpdated: SyncBatchOperation<SyncUpdatedItem> = {
    succeeded: [],
    failed: [],
  };
  const emptyDeleted: SyncBatchOperation<SyncDeletedItem> = {
    succeeded: [],
    failed: [],
  };

  it('maps known api reasons from created failures', () => {
    const message = buildSubcategoriesSyncFailureMessage(
      {
        succeeded: [],
        failed: [{ key: 'draft-id', reason: 'slug already exists' }],
      },
      emptyUpdated,
      emptyDeleted,
    );

    expect(message).toBe(
      'No se pudo crear 1 registro(s): ya existe una categoría con ese nombre.',
    );
  });

  it('groups repeated reasons and keeps unknown api messages visible', () => {
    const message = buildSubcategoriesSyncFailureMessage(
      {
        succeeded: [],
        failed: [
          { key: 'draft-one', reason: 'slug already exists' },
          { key: 'draft-two', reason: 'slug already exists' },
        ],
      },
      {
        succeeded: [],
        failed: [{ id: 'category-id', reason: 'service temporarily unavailable' }],
      },
      emptyDeleted,
    );

    expect(message).toBe(
      'No se pudo crear 2 registro(s): ya existe una categoría con ese nombre (2). No se pudo actualizar 1 registro(s): service temporarily unavailable.',
    );
  });

  it('strips the backend validation prefix without hiding the detail', () => {
    const message = buildSubcategoriesSyncFailureMessage(
      emptyCreated,
      emptyUpdated,
      {
        succeeded: [],
        failed: [
          {
            id: 'category-id',
            reason: 'validation error: name must be between 3 and 100 characters',
          },
        ],
      },
    );

    expect(message).toBe(
      'No se pudo eliminar 1 registro(s): name must be between 3 and 100 characters.',
    );
  });
});
