import { ArtworkErrorCode } from "@/src/constants/artworks/error-codes";

interface ArtworkErrorDetail {
  [key: string]: string[];
}

export const ARTWORK_ERROR_MESSAGES = {
  [ArtworkErrorCode.IMAGE_NOT_PROVIDED]: {
    title: "업로드할 이미지가 제공되지 않았습니다",
    formatDescription: () => "",
  },
  [ArtworkErrorCode.IMAGE_EXTENSION_NOT_SUPPORTED]: {
    title: "지원하지 않는 이미지 형식입니다",
    formatDescription: (errors?: ArtworkErrorDetail) => {
      if (!errors?.supportedTypes?.length) return "";
      return `지원되는 형식: ${errors.supportedTypes.join(", ")}`;
    },
  },
  [ArtworkErrorCode.IMAGE_SIZE_TOO_LARGE]: {
    title: "이미지 크기가 너무 큽니다",
    formatDescription: (errors?: ArtworkErrorDetail) => {
      if (!errors?.maxSize?.length) return "";
      return `최대 크기: ${errors.maxSize[0]}`;
    },
  },
  [ArtworkErrorCode.UNEXPECTED_ERROR]: {
    title: "예상치 못한 오류가 발생했습니다",
    formatDescription: () => "잠시 후 다시 시도해주세요",
  },
  [ArtworkErrorCode.NOT_EXISTING_GENRES_INCLUDED]: {
    title: "존재하지 않는 장르가 포함되어 있습니다",
    formatDescription: (errors?: ArtworkErrorDetail) => {
      if (!errors?.genreIds?.length) return "";
      return `해당 장르 ID: ${errors.genreIds.join(", ")}`;
    },
  },
  [ArtworkErrorCode.NOT_FOUND]: {
    title: "해당 작품을 찾을 수 없습니다",
    formatDescription: (errors?: ArtworkErrorDetail) => {
      if (!errors?.ids?.length) return "";
      return `해당 ID: ${errors.ids.join(", ")}`;
    },
  },
  [ArtworkErrorCode.ALREADY_PUBLISHED]: {
    title: "공개된 작품은 삭제할 수 없습니다",
    formatDescription: (errors?: ArtworkErrorDetail) => {
      if (!errors?.titles?.length) return "";
      return `공개된 작품: ${errors.titles.join(", ")}`;
    },
  },
  [ArtworkErrorCode.INVALID_INPUT_DATA]: {
    title: "입력값이 올바르지 않습니다",
    formatDescription: (errors?: Record<string, string[]>) => {
      if (!errors) return "";
      return Object.values(errors).flat().join("\n");
    },
  },
} as const;

export function formatArtworkErrorMessage(
  code: ArtworkErrorCode,
  errors?: ArtworkErrorDetail,
) {
  const errorConfig = ARTWORK_ERROR_MESSAGES[code];
  const description = errorConfig.formatDescription(errors);

  return {
    title: errorConfig.title,
    description: description || undefined,
  };
}
