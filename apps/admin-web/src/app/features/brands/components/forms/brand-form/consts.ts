import { BrandFormData } from './types';

export const DEFAULT_BRAND_FORM_DATA: BrandFormData = {
    name: '',
    logoUrl: [],
    description: '',
    metaTitle: '',
    metaDescription: '',
    website: '',
    visibleInMenu: true,
    isActive: true,
};

export const BRAND_LOGO_MAX_FILE_SIZE_BYTES = 5_242_880;
export const BRAND_LOGO_MAX_DATA_URL_LENGTH = 3_000_000;
export const BRAND_ALLOWED_LOGO_TYPES = [
    'image/png',
];
