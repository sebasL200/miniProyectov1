export function throwIfInvalid(
  issues: string[],
  throwInvalid: (issues: string[]) => void,
) {
  if (issues.length > 0) {
    throwInvalid(issues);
  }
}
