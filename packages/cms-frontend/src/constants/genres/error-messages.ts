import { GenreErrorCode } from "@/src/constants/genres/error-codes";

interface GenreErrorDetail {
  [key: string]: string[];
}

export const GENRE_ERROR_MESSAGES = {
  [GenreErrorCode.NOT_ENOUGH_TRANSLATIONS]: {
    title: "모든 언어의 장르명이 필요합니다",
    formatDescription: (errors?: GenreErrorDetail) => {
      if (!errors?.languages?.length) return "";
      return `누락된 언어: ${errors.languages.join(", ")}`;
    },
  },
  [GenreErrorCode.DUPLICATE_NAME]: {
    title: "이미 존재하는 장르명이 있습니다",
    formatDescription: (errors?: GenreErrorDetail) => {
      if (!errors?.names?.length) return "";
      return `중복된 이름: ${errors.names.join(", ")}`;
    },
  },
  [GenreErrorCode.NOT_FOUND]: {
    title: "해당 장르를 찾을 수 없습니다",
    formatDescription: (errors?: GenreErrorDetail) => {
      if (!errors?.ids?.length) return "";
      return `해당 ID: ${errors.ids.join(", ")}`;
    },
  },
  [GenreErrorCode.IN_USE]: {
    title: "일부 장르가 현재 작품에서 사용중입니다",
    formatDescription: (errors?: GenreErrorDetail) => {
      if (!errors?.koNames?.length) return "";
      return `해당 장르명: ${errors.koNames.join(", ")}`;
    },
  },
  [GenreErrorCode.INVALID_INPUT_DATA]: {
    title: "입력값이 올바르지 않습니다",
    formatDescription: (errors?: Record<string, string[]>) => {
      if (!errors) return "";
      return Object.values(errors).flat().join("\n");
    },
  },
} as const;

export function formatGenreErrorMessage(
  code: GenreErrorCode,
  errors?: GenreErrorDetail,
) {
  const errorConfig = GENRE_ERROR_MESSAGES[code];
  const description = errorConfig.formatDescription(errors);

  return {
    title: errorConfig.title,
    description: description || undefined,
  };
}
