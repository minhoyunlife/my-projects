import type { ArtworkErrorCode } from "@/src/constants/artworks/error-codes";
import { formatArtworkErrorMessage } from "@/src/constants/artworks/error-messages";
import { isApiError } from "@/src/lib/api/types";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const handleArtworkError = (
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
  const { title, description } = formatArtworkErrorMessage(
    code as ArtworkErrorCode,
    errors,
  );

  toast({
    title,
    description: description || defaultMessage,
    variant: "destructive",
  });
};
