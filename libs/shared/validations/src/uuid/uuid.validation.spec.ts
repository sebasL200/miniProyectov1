import { isUuid, optionalUuid, requireUuid } from './uuid.validation';

describe('uuid validations', () => {
  it('accepts valid UUID strings', () => {
    expect(isUuid('018f4dc4-5f51-7c55-9b8f-15fbdd99b101')).toBe(true);
    expect(isUuid('018F4DC4-5F51-7C55-9B8F-15FBDD99B101')).toBe(true);
  });

  it('rejects invalid UUID values', () => {
    expect(isUuid('not-a-uuid')).toBe(false);
    expect(isUuid('018f4dc4-5f51-9c55-9b8f-15fbdd99b101')).toBe(false);
    expect(isUuid(null)).toBe(false);
  });

  it('records a UUID issue for invalid values', () => {
    const issues: string[] = [];

    requireUuid('not-a-uuid', 'id', issues);

    expect(issues).toEqual(['id must be a valid UUID']);
  });

  it('accepts absent optional UUID values and rejects invalid present values', () => {
    const issues: string[] = [];

    optionalUuid(undefined, 'parentId', issues);
    optionalUuid('', 'parentId', issues);
    optionalUuid('not-a-uuid', 'parentId', issues);

    expect(issues).toEqual(['parentId must be a valid UUID']);
  });
});
