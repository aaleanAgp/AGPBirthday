export class BirthdayWidgetError extends Error {
  public readonly code: string;
  public readonly originalError: unknown;

  constructor(message: string, code: string, originalError?: unknown) {
    super(message);
    this.name = 'BirthdayWidgetError';
    this.code = code;
    this.originalError = originalError;
  }
}

export function handleError(error: unknown, context: string): BirthdayWidgetError {
  if (error instanceof BirthdayWidgetError) return error;
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[BirthdayWidget] Error in "${context}":`, error);
  return new BirthdayWidgetError(`Error in ${context}: ${message}`, 'WIDGET_ERROR', error);
}
