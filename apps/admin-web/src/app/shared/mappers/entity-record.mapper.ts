import {
  DraftRecord,
  EntityData,
  EntityRecord,
  PersistedRecord,
} from '@shared/interfaces';

/**
 * Crea un registro local (draft) con una clave única generada automáticamente.
 *
 * @template T - Tipo de dato del draft
 * @param data - Los datos del draft
 * @returns Un `DraftRecord` con `source: 'draft'` y `_recordKey` generado con `crypto.randomUUID()`
 *
 * @example
 * const draft = toDraftRecord({ name: 'Adidas', slug: 'adidas' });
 * // {
 * //   source: 'draft',
 * //   data: { _recordKey: 'a1b2c3d4-...', name: 'Adidas', slug: 'adidas' }
 * // }
 */
export function toDraftRecord<T>(data: T): DraftRecord<T & EntityData> {
  return {
    source: 'draft',
    data: { ...structuredClone(data), _recordKey: crypto.randomUUID() },
  };
}

/**
 * Crea un registro persistido usando el `id` del dato como `_recordKey`.
 *
 * @template T - Tipo de dato que debe contener un campo `id: string`
 * @param data - Los datos del registro persistido
 * @returns Un `PersistedRecord` con `source: 'persisted'` y `_recordKey` igual al `id` del dato
 *
 * @example
 * const brand = { id: 'uuid-123', name: 'Nike', slug: 'nike' };
 * const record = toPersistedRecord(brand);
 * // {
 * //   source: 'persisted',
 * //   data: { _recordKey: 'uuid-123', id: 'uuid-123', name: 'Nike', slug: 'nike' }
 * // }
 */
export function toPersistedRecord<T extends { id: string }>(
  data: T,
): PersistedRecord<T & EntityData> {
  return {
    source: 'persisted',
    data: { ...data, _recordKey: data.id },
  };
}

/**
 * Separa un arreglo mixto de registros en drafts y persistidos.
 *
 * @template TDraft - Tipo de dato de los registros locales (debe extender `EntityData`)
 * @template TPersisted - Tipo de dato de los registros persistidos (debe extender `EntityData`)
 * @param records - Arreglo de registros que puede contener drafts y persistidos mezclados
 * @returns Una tupla `[drafts, persistidos]` donde cada arreglo contiene solo su tipo correspondiente
 *
 * @example
 * const records: EntityRecord<BrandBulkDraft & EntityData, Brand & EntityData>[] = [
 *   { source: 'draft',     data: { _recordKey: 'uuid-local',  name: 'Puma',  slug: 'puma'  } },
 *   { source: 'persisted', data: { _recordKey: 'uuid-123',    id: 'uuid-123', name: 'Nike', slug: 'nike' } },
 *   { source: 'draft',     data: { _recordKey: 'uuid-local2', name: 'Reebok', slug: 'reebok' } },
 * ];
 *
 * const [drafts, persisted] = partitionRecords(records);
 *
 * drafts.length;    // 2
 * persisted.length; // 1
 */
export function partitionRecords<
  TDraft extends EntityData,
  TPersisted extends EntityData,
>(
  records: EntityRecord<TDraft, TPersisted>[],
): [DraftRecord<TDraft>[], PersistedRecord<TPersisted>[]] {
  const drafts: DraftRecord<TDraft>[] = [];
  const persisted: PersistedRecord<TPersisted>[] = [];

  for (const record of records) {
    if (record.source === 'draft') {
      drafts.push(record);
    } else {
      persisted.push(record);
    }
  }

  return [drafts, persisted];
}

/**
 * Convierte un `DraftRecord` en un `PersistedRecord` aplicando un mapper que
 * transforma los datos del draft al formato persistido.
 *
 * @template TDraft - Tipo de los datos del draft, debe extender `EntityData`.
 * @template TPersisted - Tipo del registro persistido, debe contener al menos `id: string`.
 *
 * @param draft - El registro en estado borrador que se desea persistir.
 * @param id - El identificador que se asignará al registro persistido.
 * @param mapper - Función que transforma los datos del draft al formato persistido,
 *                 recibe los datos del draft y el id como argumentos.
 *
 * @returns Un `PersistedRecord` con los datos transformados por el mapper.
 *
 * @example
 * const persisted = draftToPersistedRecord(draftRecord, 'abc-123', (data, id) => ({
 *   id,
 *   name: data.name,
 *   createdAt: new Date(),
 * }));
 */
export function draftToPersistedRecord<
  TDraft extends EntityData,
  TPersisted extends { id: string },
>(
  draft: DraftRecord<TDraft>,
  id: string,
  mapper: (draft: TDraft, id: string) => TPersisted,
): PersistedRecord<TPersisted & EntityData> {
  return toPersistedRecord(mapper(draft.data, id));
}
