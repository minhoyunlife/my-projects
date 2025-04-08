import { createSeriesSchema } from "@/src/schemas/series/create";

describe("createSeriesSchema", () => {
  describe("koTitle", () => {
    it("한글이 포함된 경우, 유효성 검사에 성공함", () => {
      const result = createSeriesSchema.safeParse({
        koTitle: "파이널 판타지",
        enTitle: "Final Fantasy",
        jaTitle: "ファイナルファンタジー",
      });

      expect(result.success).toBe(true);
    });

    it("한글이 포함되지 않은 경우, 유효성 검사에 실패함", () => {
      const result = createSeriesSchema.safeParse({
        koTitle: "Final Fantasy",
        enTitle: "Final Fantasy",
        jaTitle: "ファイナルファンタジー",
      });

      expect(result.success).toBe(false);
    });

    it("길이 제한을 초과할 경우, 유효성 검사에 실패함", () => {
      const result = createSeriesSchema.safeParse({
        koTitle: "가".repeat(101),
        enTitle: "Final Fantasy",
        jaTitle: "ファイナルファンタジー",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("enTitle", () => {
    it("순수 영문만 있는 경우 유효함", () => {
      const result = createSeriesSchema.safeParse({
        koTitle: "파이널 판타지",
        enTitle: "Final Fantasy",
        jaTitle: "ファイナルファンタジー",
      });

      expect(result.success).toBe(true);
    });

    it("영문이 아닌 문자가 포함되면 에러를 반환함", () => {
      const result = createSeriesSchema.safeParse({
        koTitle: "파이널 판타지",
        enTitle: "Final ファンタジー",
        jaTitle: "ファイナルファンタジー",
      });

      expect(result.success).toBe(false);
    });

    it("길이 제한을 초과할 경우, 유효성 검사에 실패함", () => {
      const result = createSeriesSchema.safeParse({
        koTitle: "파이널 판타지",
        enTitle: "a".repeat(101),
        jaTitle: "ファイナルファンタジー",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("jaTitle", () => {
    it("일본어가 포함된 경우 유효함", () => {
      const result = createSeriesSchema.safeParse({
        koTitle: "파이널 판타지",
        enTitle: "Final Fantasy",
        jaTitle: "ファイナルファンタジー",
      });

      expect(result.success).toBe(true);
    });

    it("일본어가 포함되지 않으면 에러를 반환함", () => {
      const result = createSeriesSchema.safeParse({
        koTitle: "파이널 판타지",
        enTitle: "Final Fantasy",
        jaTitle: "Final Fantasy",
      });

      expect(result.success).toBe(false);
    });

    it("길이 제한을 초과할 경우, 유효성 검사에 실패함", () => {
      const result = createSeriesSchema.safeParse({
        koTitle: "파이널 판타지",
        enTitle: "Final Fantasy",
        jaTitle: "は".repeat(101),
      });

      expect(result.success).toBe(false);
    });
  });
});
