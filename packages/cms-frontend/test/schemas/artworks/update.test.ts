import { updateArtworkSchema } from "@/src/schemas/artworks/update";

describe("updateArtworkSchema", () => {
  const validData = {
    koTitle: "파이널 판타지 16",
    enTitle: "Final Fantasy XVI",
    jaTitle: "ファイナルファンタジー16",
    createdAt: "2024-01-01",
    playedOn: "Steam",
    rating: 18,
    koShortReview: "재미있는 게임",
    enShortReview: "Fun game",
    jaShortReview: "面白いゲーム",
    genreIds: ["genre-1"],
  };

  describe("koTitle", () => {
    it("값이 있는 경우 유효성 검사에 성공함", () => {
      const result = updateArtworkSchema.safeParse({
        koTitle: validData.koTitle,
      });
      expect(result.success).toBe(true);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { koTitle: _, ...rest } = validData;
      const result = updateArtworkSchema.safeParse(rest);

      expect(result.success).toBe(true);
    });
  });

  describe("enTitle", () => {
    it("값이 있는 경우 유효성 검사에 성공함", () => {
      const result = updateArtworkSchema.safeParse({
        enTitle: validData.enTitle,
      });
      expect(result.success).toBe(true);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { enTitle: _, ...rest } = validData;
      const result = updateArtworkSchema.safeParse(rest);

      expect(result.success).toBe(true);
    });
  });

  describe("jaTitle", () => {
    it("값이 있는 경우 유효성 검사에 성공함", () => {
      const result = updateArtworkSchema.safeParse({
        jaTitle: validData.jaTitle,
      });
      expect(result.success).toBe(true);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { jaTitle: _, ...rest } = validData;
      const result = updateArtworkSchema.safeParse(rest);

      expect(result.success).toBe(true);
    });
  });

  describe("createdAt", () => {
    it("올바른 날짜 형식인 경우 유효성 검사에 성공함", () => {
      const result = updateArtworkSchema.safeParse({
        createdAt: "2024-01-01",
      });
      expect(result.success).toBe(true);
    });

    it("잘못된 날짜 형식인 경우 유효성 검사에 실패함", () => {
      const result = updateArtworkSchema.safeParse({
        createdAt: "20240101",
      });
      expect(result.success).toBe(false);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { createdAt: _, ...rest } = validData;
      const result = updateArtworkSchema.safeParse(rest);

      expect(result.success).toBe(true);
    });
  });

  describe("playedOn", () => {
    it("유효한 플랫폼인 경우 유효성 검사에 성공함", () => {
      const result = updateArtworkSchema.safeParse({
        playedOn: "Steam",
      });
      expect(result.success).toBe(true);
    });

    it("유효하지 않은 플랫폼인 경우 유효성 검사에 실패함", () => {
      const result = updateArtworkSchema.safeParse({
        playedOn: "Invalid Platform",
      });
      expect(result.success).toBe(false);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { playedOn: _, ...rest } = validData;
      const result = updateArtworkSchema.safeParse(rest);

      expect(result.success).toBe(true);
    });
  });

  describe("rating", () => {
    it("0-20 사이의 값인 경우 유효성 검사에 성공함", () => {
      const result = updateArtworkSchema.safeParse({
        rating: 15,
      });
      expect(result.success).toBe(true);
    });

    it("범위를 벗어난 값인 경우 유효성 검사에 실패함", () => {
      const result = updateArtworkSchema.safeParse({
        rating: 21,
      });
      expect(result.success).toBe(false);
    });

    it("정수가 아닌 경우 유효성 검사에 실패함", () => {
      const result = updateArtworkSchema.safeParse({
        rating: 10.5,
      });
      expect(result.success).toBe(false);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { rating: _, ...rest } = validData;
      const result = updateArtworkSchema.safeParse(rest);

      expect(result.success).toBe(true);
    });
  });

  describe("koShortReview", () => {
    it("값이 있는 경우 유효성 검사에 성공함", () => {
      const result = updateArtworkSchema.safeParse({
        koShortReview: validData.koShortReview,
      });
      expect(result.success).toBe(true);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { koShortReview: _, ...rest } = validData;
      const result = updateArtworkSchema.safeParse(rest);

      expect(result.success).toBe(true);
    });
  });

  describe("enShortReview", () => {
    it("값이 있는 경우 유효성 검사에 성공함", () => {
      const result = updateArtworkSchema.safeParse({
        enShortReview: validData.enShortReview,
      });
      expect(result.success).toBe(true);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { enShortReview: _, ...rest } = validData;
      const result = updateArtworkSchema.safeParse(rest);

      expect(result.success).toBe(true);
    });
  });

  describe("jaShortReview", () => {
    it("값이 있는 경우 유효성 검사에 성공함", () => {
      const result = updateArtworkSchema.safeParse({
        jaShortReview: validData.jaShortReview,
      });
      expect(result.success).toBe(true);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { jaShortReview: _, ...rest } = validData;
      const result = updateArtworkSchema.safeParse(rest);

      expect(result.success).toBe(true);
    });
  });

  describe("genreIds", () => {
    it("문자열 배열인 경우 유효성 검사에 성공함", () => {
      const result = updateArtworkSchema.safeParse({
        genreIds: validData.genreIds,
      });
      expect(result.success).toBe(true);
    });

    it("빈 배열인 경우 유효성 검사에 성공함", () => {
      const result = updateArtworkSchema.safeParse({
        genreIds: [],
      });
      expect(result.success).toBe(true);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { genreIds: _, ...rest } = validData;
      const result = updateArtworkSchema.safeParse(rest);

      expect(result.success).toBe(true);
    });
  });

  describe("스키마 전체 검증", () => {
    it("빈 객체가 제공된 경우 유효성 검사에 실패함", () => {
      const result = updateArtworkSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });
});
