import { GenreErrorCode } from "@/src/constants/genres/error-codes";
import { handleGenreError } from "@/src/lib/utils/errors/genre";

describe("handleGenreError", () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("API로 기인한 에러가 아닌 경우, 기본 메시지와 함께 토스트를 표시함", () => {
    const error = new Error("API error가 아닌 일반 에러");
    const defaultMessage = "장르 처리 중 오류가 발생했습니다";

    handleGenreError(error, mockToast, defaultMessage);

    expect(mockToast).toHaveBeenCalled();
  });

  it("API로 기인한 에러이나 에러 코드가 존재하지 않는 경우, 기본 메시지와 함께 토스트를 표시함", () => {
    const error = {
      isAxiosError: true,
      response: {
        data: {}, // code 없음
      },
    };
    const defaultMessage = "장르 처리 중 오류가 발생했습니다";

    handleGenreError(error, mockToast, defaultMessage);

    expect(mockToast).toHaveBeenCalledWith({
      title: "에러 발생",
      description: defaultMessage,
      variant: "destructive",
    });
  });

  it("API로 기인한 에러이며 에러 코드가 존재하는 경우, 검증 실패 메시지들을 표시함", () => {
    const error = {
      isAxiosError: true,
      response: {
        data: {
          code: GenreErrorCode.INVALID_INPUT_DATA,
          errors: {
            koName: ["한글을 포함해야 합니다"],
            enName: ["영문자만 입력 가능합니다"],
          },
        },
      },
    };

    handleGenreError(error, mockToast, "기본 메시지");

    expect(mockToast).toHaveBeenCalledWith({
      title: "입력값이 올바르지 않습니다",
      description: expect.stringContaining("한글을 포함해야 합니다"),
      variant: "destructive",
    });
  });
});
