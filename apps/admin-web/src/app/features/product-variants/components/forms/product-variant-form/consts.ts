import { ProductVariantFormData } from './types';

export const DEFAULT_PRODUCT_VARIANT_FORM_DATA: ProductVariantFormData = {
  product: null,
  name: '',
  sku: '',
  price: null,
  minimumStock: '0',
  barcode: '',
  description: '',
  isActive: true,
  images: [],
  dimensions: {
    width: '',
    height: '',
    length: '',
    weight: '',
  },
  attributes: [],
  attributeValues: [],
};

// Validation constraints for product variant images
// Max file size: 5 MB (5,242,880 bytes)
export const PRODUCT_VARIANT_IMAGE_MAX_FILE_SIZE_BYTES = 5_242_880;
export const PRODUCT_VARIANT_IMAGE_MAX_DATA_URL_LENGTH = 3_000_000;
export const PRODUCT_VARIANT_ALLOWED_IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/svg+xml',
];
