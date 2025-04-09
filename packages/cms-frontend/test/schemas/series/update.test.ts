import { updateSeriesSchema } from "@/src/schemas/series/update";

describe("updateSeriesSchema", () => {
  describe("koTitle", () => {
    it("한글이 포함된 경우 유효함", () => {
      const result = updateSeriesSchema.safeParse({
        koTitle: "타이틀",
      });

      expect(result.success).toBe(true);
    });

    it("값이 있을 때 한글이 포함되지 않으면 실패함", () => {
      const result = updateSeriesSchema.safeParse({
        koTitle: "Title",
      });

      expect(result.success).toBe(false);
    });

    it("1자 미만이면 실패함", () => {
      const result = updateSeriesSchema.safeParse({
        koTitle: "",
      });

      expect(result.success).toBe(false);
    });

    it("100자 초과하면 실패함", () => {
      const result = updateSeriesSchema.safeParse({
        koTitle: "아".repeat(101),
      });

      expect(result.success).toBe(false);
    });
  });

  describe("enTitle", () => {
    it("순수 영문만 있는 경우 유효함", () => {
      const result = updateSeriesSchema.safeParse({
        enTitle: "Title",
      });

      expect(result.success).toBe(true);
    });

    it("값이 있을 때 영문이 아닌 문자가 포함되면 실패함", () => {
      const result = updateSeriesSchema.safeParse({
        enTitle: "Title 타이틀",
      });

      expect(result.success).toBe(false);
    });

    it("1자 미만이면 실패함", () => {
      const result = updateSeriesSchema.safeParse({
        enTitle: "",
      });

      expect(result.success).toBe(false);
    });

    it("100자 초과하면 실패함", () => {
      const result = updateSeriesSchema.safeParse({
        enTitle: "a".repeat(101),
      });

      expect(result.success).toBe(false);
    });
  });

  describe("jaTitle", () => {
    it("일본어가 포함된 경우 유효함", () => {
      const result = updateSeriesSchema.safeParse({
        jaTitle: "タイトル",
      });

      expect(result.success).toBe(true);
    });

    it("값이 있을 때 일본어가 포함되지 않으면 실패함", () => {
      const result = updateSeriesSchema.safeParse({
        jaTitle: "Title",
      });

      expect(result.success).toBe(false);
    });

    it("1자 미만이면 실패함", () => {
      const result = updateSeriesSchema.safeParse({
        jaTitle: "",
      });

      expect(result.success).toBe(false);
    });

    it("100자 초과하면 실패함", () => {
      const result = updateSeriesSchema.safeParse({
        jaTitle: "あ".repeat(101),
      });

      expect(result.success).toBe(false);
    });
  });

  describe("필드 존재 유뮤 검증", () => {
    it("모든 필드가 유효하면 성공함", () => {
      const result = updateSeriesSchema.safeParse({
        koTitle: "타이틀",
        enTitle: "Title",
        jaTitle: "タイトル",
      });

      expect(result.success).toBe(true);
    });

    it("일부 필드만 있어도 성공함", () => {
      const result = updateSeriesSchema.safeParse({
        koTitle: "타이틀",
      });

      expect(result.success).toBe(true);
    });

    it("모든 필드가 없으면 실패함", () => {
      const result = updateSeriesSchema.safeParse({});

      expect(result.success).toBe(false);
    });
  });
});
