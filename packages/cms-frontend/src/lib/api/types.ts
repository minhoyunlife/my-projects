export interface ApiError {
  response?: {
    status?: number;
    data?: {
      message: string;
      code: string;
      errors?: { [key: string]: Array<string> };
    };
  };
  isAxiosError: boolean;
}

export const isApiError = (error: unknown): error is ApiError => {
  return (
    error !== null &&
    typeof error === "object" &&
    "isAxiosError" in error &&
    (error as ApiError).isAxiosError === true
  );
};
