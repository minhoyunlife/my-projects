import {
  ArtworkErrorCode,
  ArtworkStatusErrorCode,
} from "@/src/constants/artworks/error-codes";

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
  [ArtworkErrorCode.SOME_FAILED]: {
    title: "일부 작품의 상태 변경에 실패했습니다",
    formatDescription: (errors?: Record<string, string[]>) => {
      if (!errors) return "";
      return formatMultiStatusError(errors);
    },
  },
  [ArtworkErrorCode.NO_DATA_PROVIDED]: {
    title: "수정할 데이터가 제공되지 않았습니다",
    formatDescription: () => "",
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

const STATUS_ERROR_MESSAGES: Record<ArtworkStatusErrorCode, string> = {
  [ArtworkStatusErrorCode.FIELD_REQUIRED]: "필수 필드 누락",
  [ArtworkStatusErrorCode.OUT_OF_RANGE]: "유효 범위 초과",
  [ArtworkStatusErrorCode.NOT_EXIST]: "존재하지 않는 데이터",
  [ArtworkStatusErrorCode.NOT_FOUND]: "찾을 수 없는 작품",
  [ArtworkStatusErrorCode.UNKNOWN_FAILURE]: "알 수 없는 오류",
} as const;

function formatMultiStatusError(errors: Record<string, string[]>) {
  if (!errors) return "";

  const groupedErrors: Record<string, Record<string, string[]>> = {};

  Object.entries(errors).forEach(([errorType, fields]) => {
    fields.forEach((field) => {
      const [artworkId, fieldPath] = field.split("|");
      if (!artworkId || !fieldPath) return;

      if (!groupedErrors[artworkId]) {
        groupedErrors[artworkId] = {};
      }

      if (!groupedErrors[artworkId][errorType]) {
        groupedErrors[artworkId][errorType] = [];
      }

      groupedErrors[artworkId][errorType].push(fieldPath);
    });
  });

  // 작품별로 에러 메시지 포맷팅
  return Object.entries(groupedErrors)
    .map(([artworkId, artworkErrors]) => {
      const errorMessages = Object.entries(artworkErrors)
        .map(([errorType, fields]) => {
          const errorCode = errorType as ArtworkStatusErrorCode;
          const messageTitle = STATUS_ERROR_MESSAGES[errorCode];
          if (!messageTitle) return "";

          return `${messageTitle}:\n${fields.join("\n")}`;
        })
        .filter(Boolean)
        .join("\n");

      return `작품 ${artworkId}:\n${errorMessages}`;
    })
    .join("\n\n");
}
