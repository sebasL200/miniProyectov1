import {
  SyncBatchOperation,
  SyncCreatedItem,
  SyncDeletedItem,
  SyncFailedItem,
  SyncUpdatedItem,
} from './types';

export function buildSubcategoriesSyncFailureMessage(
  created: SyncBatchOperation<SyncCreatedItem>,
  updated: SyncBatchOperation<SyncUpdatedItem>,
  deleted: SyncBatchOperation<SyncDeletedItem>,
): string {
  const messages = [
    buildOperationFailureMessage('crear', created.failed),
    buildOperationFailureMessage('actualizar', updated.failed),
    buildOperationFailureMessage('eliminar', deleted.failed),
  ].filter((message): message is string => Boolean(message));

  return messages.join(' ');
}

function buildOperationFailureMessage(
  action: 'crear' | 'actualizar' | 'eliminar',
  failed: SyncFailedItem[],
): string | null {
  if (failed.length === 0) {
    return null;
  }

  const reasons = groupFailureReasons(failed);
  return `No se pudo ${action} ${failed.length} registro(s): ${reasons}.`;
}

function groupFailureReasons(failed: SyncFailedItem[]): string {
  const reasonCounts = failed.reduce<Map<string, number>>((counts, item) => {
    const reason = toUserFacingFailureReason(item.reason);
    counts.set(reason, (counts.get(reason) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());

  return Array.from(reasonCounts.entries())
    .map(([reason, count]) => (count > 1 ? `${reason} (${count})` : reason))
    .join('; ');
}

export function toUserFacingFailureReason(reason: string): string {
  const normalizedReason = reason.trim().toLowerCase();
  const knownReasons: Record<string, string> = {
    'slug already exists': 'ya existe una categoría con ese nombre',
    'category not found': 'la categoría no existe',
    'category has children': 'la categoría tiene subcategorías',
    'circular reference detected': 'la jerarquía generaría una referencia circular',
    'invalid input': 'los datos enviados no son válidos',
    'unknown error': 'ocurrió un error desconocido',
  };

  if (normalizedReason.startsWith('validation error: ')) {
    return reason.replace(/^validation error:\s*/i, '');
  }

  return knownReasons[normalizedReason] ?? reason;
}
