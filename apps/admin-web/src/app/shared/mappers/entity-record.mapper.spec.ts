import {
  partitionRecords,
  toDraftRecord,
  toPersistedRecord,
} from './entity-record.mapper';

describe('entity-record.mapper', () => {
  it('creates isolated draft records with a generated record key', () => {
    const randomUuid = jest
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue('00000000-0000-4000-8000-000000000000');
    const source = { name: 'Nike' };

    const record = toDraftRecord(source);

    expect(record).toEqual({
      source: 'draft',
      data: {
        _recordKey: '00000000-0000-4000-8000-000000000000',
        name: 'Nike',
      },
    });

    source.name = 'Adidas';
    expect(record.data.name).toBe('Nike');
    randomUuid.mockRestore();
  });

  it('creates persisted records keyed by their id', () => {
    expect(
      toPersistedRecord({
        id: 'brand-id',
        name: 'Nike',
      }),
    ).toEqual({
      source: 'persisted',
      data: {
        id: 'brand-id',
        name: 'Nike',
        _recordKey: 'brand-id',
      },
    });
  });

  it('partitions mixed records by source', () => {
    const [drafts, persisted] = partitionRecords([
      {
        source: 'draft' as const,
        data: { _recordKey: 'draft-id', name: 'Draft' },
      },
      {
        source: 'persisted' as const,
        data: { _recordKey: 'brand-id', id: 'brand-id', name: 'Brand' },
      },
    ]);

    expect(drafts).toEqual([
      {
        source: 'draft',
        data: { _recordKey: 'draft-id', name: 'Draft' },
      },
    ]);
    expect(persisted).toEqual([
      {
        source: 'persisted',
        data: { _recordKey: 'brand-id', id: 'brand-id', name: 'Brand' },
      },
    ]);
  });
});
