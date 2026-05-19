export function getDiff<T extends object, U extends Partial<T>>(
  original: T,
  updated: U,
): Partial<U> {
  return (Object.keys(updated) as Array<keyof U>).reduce((diff, key) => {
    const originalValue = original[key as keyof T] as unknown;
    const updatedValue = updated[key] as unknown;

    const hasChanged =
      typeof updatedValue === 'object' && updatedValue !== null
        ? JSON.stringify(originalValue) !== JSON.stringify(updatedValue)
        : (originalValue as string | number | boolean | null | undefined) !==
          (updatedValue as string | number | boolean | null | undefined);

    if (hasChanged) {
      diff[key] = updated[key];
    }
    return diff;
  }, {} as Partial<U>);
}
