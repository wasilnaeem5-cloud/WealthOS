export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function toUserFacingError(error: unknown, fallback = 'An unexpected error occurred'): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    if (error.message.includes('JWT') || error.message.includes('session')) {
      return 'Your session has expired. Please sign in again.';
    }
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    return error.message;
  }

  return fallback;
}
