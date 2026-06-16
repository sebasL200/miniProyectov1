import { ProductVariant } from '@shared/models';

export type ApiProductVariant = Omit<
  ProductVariant,
  'price' | 'offerPrice' | 'dimensions'
> & {
  price?: string | number;
  offerPrice?: string | number;
  dimensions?: Record<string, unknown> | null;
};

function toNumber(value: string | number | undefined): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  return Number(value);
}

function toDimensions(value: Record<string, unknown> | null | undefined) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const packaging = value['packaging'];

  return {
    width: typeof value['width'] === 'string' ? value['width'] : undefined,
    height: typeof value['height'] === 'string' ? value['height'] : undefined,
    length: typeof value['length'] === 'string' ? value['length'] : undefined,
    weight: typeof value['weight'] === 'string' ? value['weight'] : undefined,
    packaging:
      packaging && typeof packaging === 'object' && !Array.isArray(packaging)
        ? {
            unit:
              typeof (packaging as Record<string, unknown>)['unit'] === 'string'
                ? ((packaging as Record<string, unknown>)['unit'] as string)
                : undefined,
            depth:
              typeof (packaging as Record<string, unknown>)['depth'] ===
              'number'
                ? ((packaging as Record<string, unknown>)['depth'] as number)
                : undefined,
            width:
              typeof (packaging as Record<string, unknown>)['width'] ===
              'number'
                ? ((packaging as Record<string, unknown>)['width'] as number)
                : undefined,
            height:
              typeof (packaging as Record<string, unknown>)['height'] ===
              'number'
                ? ((packaging as Record<string, unknown>)['height'] as number)
                : undefined,
          }
        : undefined,
  };
}

export function toProductVariant(value: ApiProductVariant): ProductVariant {
  return {
    ...value,
    price: toNumber(value.price),
    offerPrice: toNumber(value.offerPrice),
    dimensions: toDimensions(value.dimensions),
  };
}
