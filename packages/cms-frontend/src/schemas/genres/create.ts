import { z } from "zod";

import { LANGUAGE_REGEX } from "@/src/lib/utils/regex";

export type CreateGenreFormData = z.infer<typeof createGenreSchema>;

/**
 * 장르 생성 시의 밸리데이션 스키마
 */
export const createGenreSchema = z.object({
  koName: z
    .string()
    .min(1, "한국어 장르명은 필수입니다")
    .max(30, "30자 이내로 입력해주세요")
    .refine(
      (value) => LANGUAGE_REGEX.KOREAN.test(value),
      "한글을 포함해야 합니다 (영문, 숫자 포함 가능)",
    ),
  enName: z
    .string()
    .min(1, "영어 장르명은 필수입니다")
    .max(30, "30자 이내로 입력해주세요")
    .refine(
      (value) => LANGUAGE_REGEX.ENGLISH.test(value),
      "영문자만 입력 가능합니다",
    ),
  jaName: z
    .string()
    .min(1, "일본어 장르명은 필수입니다")
    .max(30, "30자 이내로 입력해주세요")
    .refine(
      (value) => LANGUAGE_REGEX.JAPANESE.test(value),
      "일본어를 포함해야 합니다 (영문, 숫자 포함 가능)",
    ),
});
