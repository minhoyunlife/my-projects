/**
 * 작품 처리에 관한 최상위 에러 코드
 */
export enum ArtworkErrorCode {
  // 이미지 업로드 관련
  IMAGE_NOT_PROVIDED = "UPLOAD_SIZE_EXCEEDED",
  IMAGE_EXTENSION_NOT_SUPPORTED = "INVALID_FILE_TYPE",
  IMAGE_SIZE_TOO_LARGE = "UPLOAD_FAILED",
  UNEXPECTED_ERROR = "UNEXPECTED_ERROR",

  // 메타데이터 관련
  NOT_EXISTING_GENRES_INCLUDED = "NOT_EXISTING_GENRES_INCLUDED",
  INVALID_INPUT_DATA = "INVALID_INPUT_DATA",
  NOT_FOUND = "NOT_FOUND",
  ALREADY_PUBLISHED = "ALREADY_PUBLISHED",
  SOME_FAILED = "SOME_FAILED",
  NO_DATA_PROVIDED = "NO_DATA_PROVIDED",
}

/**
 * 작품 공개 전환 시의 검증 관련 하위 에러 코드
 */
export enum ArtworkStatusErrorCode {
  FIELD_REQUIRED = "FIELD_REQUIRED",
  OUT_OF_RANGE = "OUT_OF_RANGE",
  NOT_EXIST = "NOT_EXIST",
  NOT_FOUND = "NOT_FOUND",
  UNKNOWN_FAILURE = "UNKNOWN_FAILURE",
}
