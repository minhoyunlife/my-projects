interface RetryOptions {
  maxAttempts?: number;
  delayMs?: number;
  onError?: (error: Error, attempt: number) => void;
}

/**
 * 작업을 지정된 횟수만큼 재시도하는 유틸리티 함수
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, onError } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (onError) {
        onError(error, attempt);
      }

      if (attempt === maxAttempts) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}
