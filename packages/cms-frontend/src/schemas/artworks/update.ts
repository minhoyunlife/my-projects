import { z } from "zod";

import { Platform } from "@/src/constants/artworks/platform";

export type UpdateArtworkFormData = z.infer<typeof updateArtworkSchema>;

/**
 * 작품 수정 시의 밸리데이션 스키마
 */
export const updateArtworkSchema = z
  .object({
    koTitle: z
      .string()
      .min(1, "한국어 제목은 필수입니다")
      .max(100, "100자 이하여야 합니다"),
    enTitle: z
      .string()
      .min(1, "영어 제목은 필수입니다")
      .max(100, "100자 이하여야 합니다"),
    jaTitle: z
      .string()
      .min(1, "일본어 제목은 필수입니다")
      .max(100, "100자 이하여야 합니다"),
    createdAt: z.preprocess(
      (value) => {
        if (value === "" || value === undefined) return undefined;
        return value;
      },
      z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "올바른 날짜 형식이 아닙니다")
        .transform((date) => new Date(date).toISOString())
        .optional(),
    ),
    playedOn: z.enum(Platform),
    rating: z.preprocess(
      (value) => {
        if (value === "" || value === undefined || isNaN(value as number)) {
          return undefined;
        }
        return Number(value);
      },
      z
        .number()
        .int("정수만 입력 가능합니다")
        .min(0, "0점 이상이어야 합니다")
        .max(20, "20점 이하여야 합니다"),
    ),
    koShortReview: z.string().max(200, "200자 이하여야 합니다"),
    enShortReview: z.string().max(200, "200자 이하여야 합니다"),
    jaShortReview: z.string().max(200, "200자 이하여야 합니다"),
    genreIds: z.array(z.string()),
  })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "최소 하나의 필드는 수정해야 합니다",
  });
