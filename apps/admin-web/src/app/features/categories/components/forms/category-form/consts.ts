import { CategoryFormData } from './types';

export const DEFAULT_CATEGORY_FORM_DATA: CategoryFormData = {
    name: '',
    description: '',
    imageUrl: [],
    metaTitle: '',
    metaDescription: '',
    visibleInMenu: true,
    isActive: true,
};

export const CATEGORY_IMAGE_MAX_FILE_SIZE_BYTES = 5_242_880;
export const CATEGORY_IMAGE_MAX_DATA_URL_LENGTH = 3_000_000;
export const CATEGORY_ALLOWED_IMAGE_TYPES = [
    'image/png',
];
