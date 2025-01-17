import { z } from "zod";

import { GENRE_REGEX } from "@/src/lib/utils/regex";

export type UpdateGenreFormData = z.infer<typeof updateGenreSchema>;

export const updateGenreSchema = z
  .object({
    koName: z
      .string()
      .min(1, "한국어 장르명은 필수입니다")
      .max(30, "30자 이내로 입력해주세요")
      .optional()
      .refine(
        (value) => !value || GENRE_REGEX.KOREAN.test(value),
        "한글을 포함해야 합니다 (영문, 숫자 포함 가능)",
      ),
    enName: z
      .string()
      .min(1, "영어 장르명은 필수입니다")
      .max(30, "30자 이내로 입력해주세요")
      .optional()
      .refine(
        (value) => !value || GENRE_REGEX.ENGLISH.test(value),
        "영문자만 입력 가능합니다",
      ),
    jaName: z
      .string()
      .min(1, "일본어 장르명은 필수입니다")
      .max(30, "30자 이내로 입력해주세요")
      .optional()
      .refine(
        (value) => !value || GENRE_REGEX.JAPANESE.test(value),
        "일본어를 포함해야 합니다 (영문, 숫자 포함 가능)",
      ),
  })
  .refine(
    (data) => Object.values(data).some(Boolean),
    "적어도 하나의 언어는 입력해야 합니다",
  );
