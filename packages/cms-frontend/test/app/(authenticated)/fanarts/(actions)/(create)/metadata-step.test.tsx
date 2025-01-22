import { render, screen } from "@testing-library/react";
import { act, fireEvent, waitFor } from "@testing-library/react";

import { MetadataStep } from "@/src/app/(authenticated)/fanarts/(actions)/(create)/metadata-step";
import { wrapper } from "@/test/utils/test-query-client";

const mockCreateMutation = {
  mutateAsync: vi.fn(),
  isPending: false,
  onProgress: vi.fn(),
};

vi.mock("@/src/hooks/artworks/use-artworks", () => ({
  useArtworks: () => ({
    useCreate: () => mockCreateMutation,
  }),
}));

const mockToast = vi.fn();
vi.mock("@/src/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe("MetadataStep", () => {
  const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillRequiredFields = () => {
    fireEvent.change(screen.getByPlaceholderText("작품 제목(한국어)"), {
      target: { value: "테스트 작품" },
    });
    fireEvent.change(screen.getByPlaceholderText("작품 제목(영어)"), {
      target: { value: "Test Artwork" },
    });
    fireEvent.change(screen.getByPlaceholderText("작품 제목(일본어)"), {
      target: { value: "テスト作品" },
    });
  };

  it("유효한 데이터로 폼 제출 시 작품이 생성됨", async () => {
    mockCreateMutation.mutateAsync.mockResolvedValueOnce({});

    const { container } = render(
      <MetadataStep
        file={mockFile}
        onSuccess={mockOnSuccess}
      />,
      { wrapper },
    );

    fillRequiredFields();

    const form = container.querySelector("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockCreateMutation.mutateAsync).toHaveBeenCalledWith({
        file: mockFile,
        data: expect.objectContaining({
          koTitle: "테스트 작품",
          enTitle: "Test Artwork",
          jaTitle: "テスト作品",
        }),
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: "작품이 등록되었습니다",
        variant: "success",
      });
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it("API 에러 발생 시 에러 토스트를 표시함", async () => {
    const mockError = {
      isAxiosError: true,
      response: {
        data: {
          code: "INVALID_INPUT_DATA",
          errors: {
            koTitle: ["제목은 필수입니다"],
          },
        },
      },
    };
    mockCreateMutation.mutateAsync.mockRejectedValueOnce(mockError);

    const { container } = render(
      <MetadataStep
        file={mockFile}
        onSuccess={mockOnSuccess}
      />,
      { wrapper },
    );

    fillRequiredFields();

    const form = container.querySelector("form");
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
        }),
      );
    });
  });

  it("업로드 진행 중일 때 프로그레스 바가 표시됨", () => {
    mockCreateMutation.isPending = true;

    render(
      <MetadataStep
        file={mockFile}
        onSuccess={mockOnSuccess}
      />,
      { wrapper },
    );

    expect(screen.getByText("이미지 업로드 중...")).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
