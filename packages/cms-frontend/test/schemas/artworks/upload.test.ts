import { uploadSchema } from "@/src/schemas/artworks/upload";

describe("uploadSchema", () => {
  describe("file", () => {
    it("유효한 이미지 파일인 경우 유효성 검사에 성공함", () => {
      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
      const result = uploadSchema.safeParse({ file });
      expect(result.success).toBe(true);
    });

    it("File 인스턴스가 아닌 경우 유효성 검사에 실패함", () => {
      const result = uploadSchema.safeParse({
        file: { name: "test.jpg", type: "image/jpeg" },
      });
      expect(result.success).toBe(false);
    });

    it("100MB 이하인 경우 유효성 검사에 성공함", () => {
      const file = new File(["x".repeat(1024 * 1024)], "test.jpg", {
        type: "image/jpeg",
      });
      const result = uploadSchema.safeParse({ file });
      expect(result.success).toBe(true);
    });

    it("100MB 초과인 경우 유효성 검사에 실패함", () => {
      const file = new File(["x".repeat(101 * 1024 * 1024)], "test.jpg", {
        type: "image/jpeg",
      });
      const result = uploadSchema.safeParse({ file });
      expect(result.success).toBe(false);
    });

    it.each([["image/jpeg"], ["image/jpg"], ["image/png"], ["image/webp"]])(
      "%s 타입인 경우 유효성 검사에 성공함",
      (mimeType) => {
        const file = new File(["test"], "test.jpg", { type: mimeType });
        const result = uploadSchema.safeParse({ file });
        expect(result.success).toBe(true);
      },
    );

    it.each([["image/gif"], ["application/pdf"]])(
      "%s 타입인 경우 유효성 검사에 실패함",
      (mimeType) => {
        const file = new File(["test"], "test.jpg", { type: mimeType });
        const result = uploadSchema.safeParse({ file });
        expect(result.success).toBe(false);
      },
    );
  });
});
