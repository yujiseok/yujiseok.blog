export const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback;
