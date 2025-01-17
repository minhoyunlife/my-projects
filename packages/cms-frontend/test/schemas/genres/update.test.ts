import { updateGenreSchema } from "@/src/schemas/genres/update";

describe("updateGenreSchema", () => {
  describe("koName", () => {
    it("한글이 포함된 경우 유효함", () => {
      const result = updateGenreSchema.safeParse({
        koName: "액션 RPG",
      });

      expect(result.success).toBe(true);
    });

    it("값이 있을 때 한글이 포함되지 않으면 실패함", () => {
      const result = updateGenreSchema.safeParse({
        koName: "Action RPG",
      });

      expect(result.success).toBe(false);
    });

    it("1자 미만이면 실패함", () => {
      const result = updateGenreSchema.safeParse({
        koName: "",
      });

      expect(result.success).toBe(false);
    });

    it("30자 초과하면 실패함", () => {
      const result = updateGenreSchema.safeParse({
        koName: "아".repeat(31),
      });

      expect(result.success).toBe(false);
    });
  });

  describe("enName", () => {
    it("순수 영문만 있는 경우 유효함", () => {
      const result = updateGenreSchema.safeParse({
        enName: "Action RPG",
      });

      expect(result.success).toBe(true);
    });

    it("값이 있을 때 영문이 아닌 문자가 포함되면 실패함", () => {
      const result = updateGenreSchema.safeParse({
        enName: "Action RPG 액션",
      });

      expect(result.success).toBe(false);
    });

    it("1자 미만이면 실패함", () => {
      const result = updateGenreSchema.safeParse({
        enName: "",
      });

      expect(result.success).toBe(false);
    });

    it("30자 초과하면 실패함", () => {
      const result = updateGenreSchema.safeParse({
        enName: "a".repeat(31),
      });

      expect(result.success).toBe(false);
    });
  });

  describe("jaName", () => {
    it("일본어가 포함된 경우 유효함", () => {
      const result = updateGenreSchema.safeParse({
        jaName: "アクションRPG",
      });

      expect(result.success).toBe(true);
    });

    it("값이 있을 때 일본어가 포함되지 않으면 실패함", () => {
      const result = updateGenreSchema.safeParse({
        jaName: "Action RPG",
      });

      expect(result.success).toBe(false);
    });

    it("1자 미만이면 실패함", () => {
      const result = updateGenreSchema.safeParse({
        jaName: "",
      });

      expect(result.success).toBe(false);
    });

    it("30자 초과하면 실패함", () => {
      const result = updateGenreSchema.safeParse({
        jaName: "あ".repeat(31),
      });

      expect(result.success).toBe(false);
    });
  });

  describe("필드 존재 유뮤 검증", () => {
    it("모든 필드가 유효하면 성공함", () => {
      const result = updateGenreSchema.safeParse({
        koName: "액션 RPG",
        enName: "Action RPG",
        jaName: "アクションRPG",
      });

      expect(result.success).toBe(true);
    });

    it("일부 필드만 있어도 성공함", () => {
      const result = updateGenreSchema.safeParse({
        koName: "액션 RPG",
      });

      expect(result.success).toBe(true);
    });

    it("모든 필드가 없으면 실패함", () => {
      const result = updateGenreSchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });
});
