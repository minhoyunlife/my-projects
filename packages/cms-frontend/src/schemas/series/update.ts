import { z } from "zod";

import { LANGUAGE_REGEX } from "@/src/lib/utils/regex";

export type UpdateSeriesFormData = z.infer<typeof updateSeriesSchema>;

export const updateSeriesSchema = z
  .object({
    koTitle: z
      .string()
      .min(1, "한국어 시리즈 제목은 필수입니다")
      .max(100, "100자 이내로 입력해주세요")
      .optional()
      .refine(
        (value) => !value || LANGUAGE_REGEX.KOREAN.test(value),
        "한글을 포함해야 합니다 (영문, 숫자 포함 가능)",
      ),
    enTitle: z
      .string()
      .min(1, "영어 시리즈 제목은 필수입니다")
      .max(100, "100자 이내로 입력해주세요")
      .optional()
      .refine(
        (value) => !value || LANGUAGE_REGEX.ENGLISH.test(value),
        "영문자만 입력 가능합니다",
      ),
    jaTitle: z
      .string()
      .min(1, "일본어 시리즈 제목은 필수입니다")
      .max(100, "100자 이내로 입력해주세요")
      .optional()
      .refine(
        (value) => !value || LANGUAGE_REGEX.JAPANESE.test(value),
        "일본어를 포함해야 합니다 (영문, 숫자 포함 가능)",
      ),
  })
  .refine(
    (data) => Object.values(data).some(Boolean),
    "적어도 하나의 언어는 입력해야 합니다",
  );
