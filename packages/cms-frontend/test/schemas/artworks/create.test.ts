import { createArtworkSchema } from "@/src/schemas/artworks/create";

describe("createArtworkSchema", () => {
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
      const result = createArtworkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("값이 없는 경우 유효성 검사에 실패함", () => {
      const result = createArtworkSchema.safeParse({
        ...validData,
        koTitle: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("enTitle", () => {
    it("값이 있는 경우 유효성 검사에 성공함", () => {
      const result = createArtworkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("값이 없는 경우 유효성 검사에 실패함", () => {
      const result = createArtworkSchema.safeParse({
        ...validData,
        enTitle: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("jaTitle", () => {
    it("값이 있는 경우 유효성 검사에 성공함", () => {
      const result = createArtworkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("값이 없는 경우 유효성 검사에 실패함", () => {
      const result = createArtworkSchema.safeParse({
        ...validData,
        jaTitle: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("createdAt", () => {
    it("올바른 날짜 형식인 경우 유효성 검사에 성공함", () => {
      const result = createArtworkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("잘못된 날짜 형식인 경우 유효성 검사에 실패함", () => {
      const result = createArtworkSchema.safeParse({
        ...validData,
        createdAt: "20240101",
      });
      expect(result.success).toBe(false);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { createdAt, ...rest } = validData;
      const result = createArtworkSchema.safeParse(rest);

      expect(result.success).toBe(true);
    });
  });

  describe("playedOn", () => {
    it("유효한 플랫폼인 경우 유효성 검사에 성공함", () => {
      const result = createArtworkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("유효하지 않은 플랫폼인 경우 유효성 검사에 실패함", () => {
      const result = createArtworkSchema.safeParse({
        ...validData,
        playedOn: "Invalid Platform",
      });
      expect(result.success).toBe(false);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { playedOn, ...rest } = validData;
      const result = createArtworkSchema.safeParse(rest);
      expect(result.success).toBe(true);
    });
  });

  describe("rating", () => {
    it("0-20 사이의 값인 경우 유효성 검사에 성공함", () => {
      const result = createArtworkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("범위를 벗어난 값인 경우 유효성 검사에 실패함", () => {
      const result = createArtworkSchema.safeParse({
        ...validData,
        rating: 21,
      });
      expect(result.success).toBe(false);
    });

    it("정수가 아닌 경우 유효성 검사에 실패함", () => {
      const result = createArtworkSchema.safeParse({
        ...validData,
        rating: 10.5,
      });
      expect(result.success).toBe(false);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { rating, ...rest } = validData;
      const result = createArtworkSchema.safeParse(rest);
      expect(result.success).toBe(true);
    });
  });

  describe("koShortReview", () => {
    it("값이 있는 경우 유효성 검사에 성공함", () => {
      const result = createArtworkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { koShortReview, ...rest } = validData;
      const result = createArtworkSchema.safeParse(rest);
      expect(result.success).toBe(true);
    });
  });

  describe("enShortReview", () => {
    it("값이 있는 경우 유효성 검사에 성공함", () => {
      const result = createArtworkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { enShortReview, ...rest } = validData;
      const result = createArtworkSchema.safeParse(rest);
      expect(result.success).toBe(true);
    });
  });

  describe("jaShortReview", () => {
    it("값이 있는 경우 유효성 검사에 성공함", () => {
      const result = createArtworkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { jaShortReview, ...rest } = validData;
      const result = createArtworkSchema.safeParse(rest);
      expect(result.success).toBe(true);
    });
  });

  describe("genreIds", () => {
    it("문자열 배열인 경우 유효성 검사에 성공함", () => {
      const result = createArtworkSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("값이 없는 경우에도 유효성 검사에 성공함", () => {
      const { genreIds, ...rest } = validData;
      const result = createArtworkSchema.safeParse(rest);
      expect(result.success).toBe(true);
    });
  });
});
