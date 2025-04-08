export const LANGUAGE_REGEX = {
  // 한글이 최소 1자 이상 포함 (영문, 숫자, 공백, 하이픈 허용)
  KOREAN: /^(?=.*[가-힣])[가-힣A-Za-z0-9\s-]+$/,

  // 영문자만 허용 (숫자, 공백, 하이픈 허용)
  ENGLISH: /^[A-Za-z0-9\s-]+$/,

  // 일본어가 최소 1자 이상 포함 (영문, 숫자, 공백, 하이픈 허용)
  JAPANESE:
    /^(?=.*[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF])[A-Za-z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s-]+$/,
} as const;
