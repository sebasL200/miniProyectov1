export function formatInputDateValue(value: Date | string | null): string | null {
  if (!value) {
    return null;
  }

  const date = typeof value === 'string' ? new Date(value) : value;

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function parseInputDateValue(value: string): Date | null {
  if (!value) {
    return null;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const nextValue = new Date(year, month, day);

  if (
    nextValue.getFullYear() !== year ||
    nextValue.getMonth() !== month ||
    nextValue.getDate() !== day
  ) {
    return null;
  }

  return nextValue;
}
