import { SeriesErrorCode } from "./error-codes";

interface SeriesErrorDetail {
  [key: string]: string[];
}

export const SERIES_ERROR_MESSAGES = {
  [SeriesErrorCode.NOT_ENOUGH_TRANSLATIONS]: {
    title: "모든 언어의 시리즈명이 필요합니다",
    formatDescription: (errors?: SeriesErrorDetail) => {
      if (!errors?.languages?.length) return "";
      return `누락된 언어: ${errors.languages.join(", ")}`;
    },
  },
  [SeriesErrorCode.NO_TRANSLATIONS_PROVIDED]: {
    title: "시리즈명이 필요합니다",
    formatDescription: (errors?: SeriesErrorDetail) => {
      if (!errors?.languages?.length) return "";
      return `누락된 언어: ${errors.languages.join(", ")}`;
    },
  },
  [SeriesErrorCode.DUPLICATE_TITLE]: {
    title: "이미 존재하는 시리즈명이 있습니다",
    formatDescription: (errors?: SeriesErrorDetail) => {
      if (!errors?.title?.length) return "";
      return `중복된 이름: ${errors.title.join(", ")}`;
    },
  },
  [SeriesErrorCode.NOT_FOUND]: {
    title: "해당 시리즈를 찾을 수 없습니다",
    formatDescription: (errors?: SeriesErrorDetail) => {
      if (!errors?.ids?.length) return "";
      return `해당 ID: ${errors.ids.join(", ")}`;
    },
  },
  [SeriesErrorCode.IN_USE]: {
    title: "일부 시리즈가 현재 작품에서 사용중입니다",
    formatDescription: (errors?: SeriesErrorDetail) => {
      if (!errors?.koTitle?.length) return "";
      return `해당 장르명: ${errors.koTitle.join(", ")}`;
    },
  },
  [SeriesErrorCode.INVALID_INPUT_DATA]: {
    title: "입력값이 올바르지 않습니다",
    formatDescription: (errors?: Record<string, string[]>) => {
      if (!errors) return "";
      return Object.values(errors).flat().join("\n");
    },
  },
} as const;

export function formatSeriesErrorMessage(
  code: SeriesErrorCode,
  errors?: SeriesErrorDetail,
) {
  const errorConfig = SERIES_ERROR_MESSAGES[code];
  const description = errorConfig.formatDescription(errors);

  return {
    title: errorConfig.title,
    description: description || undefined,
  };
}
