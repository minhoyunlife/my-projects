import { createGenreSchema } from "@/src/schemas/genres/create";

describe("createGenreSchema", () => {
  describe("koName", () => {
    it("한글이 포함된 경우, 유효성 검사에 성공함", () => {
      const result = createGenreSchema.safeParse({
        koName: "액션 RPG",
        enName: "Action RPG",
        jaName: "アクションRPG",
      });

      expect(result.success).toBe(true);
    });

    it("한글이 포함되지 않은 경우, 유효성 검사에 실패함", () => {
      const result = createGenreSchema.safeParse({
        koName: "Action RPG",
        enName: "Action RPG",
        jaName: "アクションRPG",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("enName", () => {
    it("순수 영문만 있는 경우 유효함", () => {
      const result = createGenreSchema.safeParse({
        koName: "액션 RPG",
        enName: "Action RPG",
        jaName: "アクションRPG",
      });

      expect(result.success).toBe(true);
    });

    it("영문이 아닌 문자가 포함되면 에러를 반환함", () => {
      const result = createGenreSchema.safeParse({
        koName: "액션 RPG",
        enName: "Action RPG 액션",
        jaName: "アクションRPG",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("jaName", () => {
    it("일본어가 포함된 경우 유효함", () => {
      const result = createGenreSchema.safeParse({
        koName: "액션 RPG",
        enName: "Action RPG",
        jaName: "アクションRPG",
      });

      expect(result.success).toBe(true);
    });

    it("일본어가 포함되지 않으면 에러를 반환함", () => {
      const result = createGenreSchema.safeParse({
        koName: "액션 RPG",
        enName: "Action RPG",
        jaName: "Action RPG",
      });

      expect(result.success).toBe(false);
    });
  });
});
