import type { SeriesErrorCode } from "@/src/constants/series/error-codes";
import { formatSeriesErrorMessage } from "@/src/constants/series/error-messages";
import { isApiError } from "@/src/lib/api/types";

interface ToastOptions {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

export const handleSeriesError = (
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
  const { title, description } = formatSeriesErrorMessage(
    code as SeriesErrorCode,
    errors,
  );

  toast({
    title,
    description: description || defaultMessage,
    variant: "destructive",
  });
};
