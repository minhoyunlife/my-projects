import type { GenreErrorCode } from "@/src/constants/genres/error-codes";
import { formatGenreErrorMessage } from "@/src/constants/genres/error-messages";
import { isApiError } from "@/src/lib/api/types";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const handleGenreError = (
  error: unknown,
  toast: (options: ToastOptions) => void,
  defaultMessage: string,
): void => {
  if (!isApiError(error) || !error.response?.data?.code) {
    toast({
      title: "에러 발생",
      description: defaultMessage,
      variant: "destructive",
    });
    return;
  }

  const { code, errors } = error.response.data;
  const { title, description } = formatGenreErrorMessage(
    code as GenreErrorCode,
    errors,
  );

  toast({
    title,
    description: description || defaultMessage,
    variant: "destructive",
  });
};
