const DUPLICATE_VARIANT_ATTRIBUTE_COMBINATION_MESSAGE =
  'duplicate variant attribute combination';

const PRODUCT_VARIANT_ERROR_MESSAGES: Record<string, string> = {
  [DUPLICATE_VARIANT_ATTRIBUTE_COMBINATION_MESSAGE]:
    'Ya existe una variante con la misma combinación de atributos y valores.',
};

export function getProductVariantErrorMessage(error: unknown): string | null {
  const message = getHttpErrorMessage(error);

  if (!message) {
    return null;
  }

  return PRODUCT_VARIANT_ERROR_MESSAGES[normalizeErrorMessage(message)] ?? message;
}

function getHttpErrorMessage(error: unknown): string | null {
  if (
    error &&
    typeof error === 'object' &&
    'error' in error &&
    error.error &&
    typeof error.error === 'object' &&
    'message' in error.error &&
    typeof error.error.message === 'string'
  ) {
    return error.error.message;
  }

  return null;
}

function normalizeErrorMessage(message: string): string {
  return message.trim().toLowerCase();
}
