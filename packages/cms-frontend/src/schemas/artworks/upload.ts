import { z } from "zod";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export type UploadFormData = z.infer<typeof uploadSchema>;

export const uploadSchema = z.object({
  file: z
    .custom<File>((value) => value instanceof File, {
      message: "유효한 파일이 아닙니다",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: "파일 크기는 100MB 이하여야 합니다",
    })
    .refine((file) => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: "JPG, PNG, WebP 형식의 이미지만 업로드 가능합니다",
    }),
});
