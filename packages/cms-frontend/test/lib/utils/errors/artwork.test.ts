import { ArtworkErrorCode } from "@/src/constants/artworks/error-codes";
import { handleArtworkError } from "@/src/lib/utils/errors/artwork";

describe("handleArtworkError", () => {
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("API로 기인한 에러가 아닌 경우, 기본 메시지와 함께 토스트를 표시함", () => {
    const error = new Error("API error가 아닌 일반 에러");
    const defaultMessage = "장르 처리 중 오류가 발생했습니다";

    handleArtworkError(error, mockToast, defaultMessage);

    expect(mockToast).toHaveBeenCalled();
  });

  it("API로 기인한 에러이나 에러 코드가 존재하지 않는 경우, 기본 메시지와 함께 토스트를 표시함", () => {
    const error = {
      isAxiosError: true,
      response: {
        data: {}, // code 없음
      },
    };
    const defaultMessage = "작품 처리 중 오류가 발생했습니다";

    handleArtworkError(error, mockToast, defaultMessage);

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
          code: ArtworkErrorCode.IMAGE_SIZE_TOO_LARGE,
          errors: {
            maxSize: ["100MB"],
          },
        },
      },
    };

    handleArtworkError(error, mockToast, "기본 메시지");

    expect(mockToast).toHaveBeenCalledWith({
      title: "이미지 크기가 너무 큽니다",
      description: "최대 크기: 100MB",
      variant: "destructive",
    });
  });
});
