export type EntityRecordSource = 'draft' | 'persisted';
export type EntityData = { _recordKey: string };

export type DraftRecord<T extends EntityData> = { source: 'draft'; data: T };
export type PersistedRecord<T extends EntityData> = {
  source: 'persisted';
  data: T;
};
export type EntityRecord<
  TDraft extends EntityData,
  TPersisted extends EntityData,
> = DraftRecord<TDraft> | PersistedRecord<TPersisted>;
