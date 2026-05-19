export const duration = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
} as const;

export type Duration = keyof typeof duration;
