import {
  UpdateArtworkForm,
  type Artwork,
} from "@/src/app/(authenticated)/fanarts/(actions)/update";
import { wrapper } from "@/test/utils/test-query-client";

const mockMutateAsync = vi.fn();
vi.mock("@/src/hooks/artworks/use-artworks", () => ({
  useArtworks: () => ({
    useUpdate: () => ({
      mutateAsync: mockMutateAsync,
      isPending: false,
    }),
  }),
}));

const mockToast = vi.fn();
vi.mock("@/src/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

describe("UpdateArtworkForm", () => {
  const mockArtwork = {
    id: "artwork-1",
    imageUrl: "https://example.com/image.jpg",
    translations: [
      { language: "ko", title: "테스트 작품", shortReview: "재미있어요" },
      { language: "en", title: "Test Artwork", shortReview: "It's fun" },
      { language: "ja", title: "テスト作品", shortReview: "楽しいです" },
    ],
    createdAt: "2024-02-06",
    playedOn: "Steam",
    rating: 15,
    genres: [
      {
        id: "genre-1",
        translations: [
          { language: "ko", name: "액션" },
          { language: "en", name: "Action" },
          { language: "ja", name: "アクション" },
        ],
      },
    ],
    isDraft: true,
  } as Artwork;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("초기값이 올바르게 설정됨", () => {
    render(<UpdateArtworkForm artwork={mockArtwork} />, { wrapper });

    expect(reactScreen.getByPlaceholderText("작품 제목(한국어)")).toHaveValue(
      "테스트 작품",
    );
    expect(reactScreen.getByPlaceholderText("작품 제목(영어)")).toHaveValue(
      "Test Artwork",
    );
    expect(reactScreen.getByPlaceholderText("작품 제목(일본어)")).toHaveValue(
      "テスト作品",
    );

    expect(reactScreen.getByDisplayValue("2024-02-06")).toBeInTheDocument();
    // 시각적 요소로 플랫폼 코박스를 확인
    const platformElements = reactScreen.getAllByRole("combobox");
    const platformSelect = platformElements.find((el) =>
      el.textContent?.includes("Steam"),
    );
    expect(platformSelect).toBeTruthy();
    expect(reactScreen.getByPlaceholderText("평점 (0-20)")).toHaveValue(15);

    expect(reactScreen.getByPlaceholderText("한줄평(한국어)")).toHaveValue(
      "재미있어요",
    );
    expect(reactScreen.getByPlaceholderText("한줄평(영어)")).toHaveValue(
      "It's fun",
    );
    expect(reactScreen.getByPlaceholderText("한줄평(일본어)")).toHaveValue(
      "楽しいです",
    );
  });

  it("발행된 작품의 경우 모든 필드가 비활성화됨", () => {
    const publishedArtwork = { ...mockArtwork, isDraft: false };
    render(<UpdateArtworkForm artwork={publishedArtwork} />, { wrapper });

    const inputs = reactScreen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });

    expect(
      reactScreen.getByRole("button", { name: "작품 수정" }),
    ).toBeDisabled();
  });

  it("유효한 데이터로 폼 제출 시 작품이 수정됨", async () => {
    mockMutateAsync.mockResolvedValueOnce({});
    const onSuccess = vi.fn();

    render(
      <UpdateArtworkForm
        artwork={mockArtwork}
        onSuccess={onSuccess}
      />,
      { wrapper },
    );

    const koTitleInput = reactScreen.getByPlaceholderText("작품 제목(한국어)");
    await userEvent.clear(koTitleInput);
    await userEvent.type(koTitleInput, "수정된 제목");

    const ratingInput = reactScreen.getByPlaceholderText("평점 (0-20)");
    await userEvent.clear(ratingInput);
    await userEvent.type(ratingInput, "18");

    const form = reactScreen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        id: mockArtwork.id,
        data: expect.objectContaining({
          koTitle: "수정된 제목",
          rating: 18,
        }),
      });
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "작품이 수정되었습니다",
          variant: "success",
        }),
      );
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it("API 에러 발생 시 에러 토스트를 표시함", async () => {
    const mockError = {
      isAxiosError: true,
      response: {
        data: {
          code: "INVALID_INPUT_DATA",
          errors: {
            koTitle: ["제목은 필수 항목입니다."],
          },
        },
      },
    };
    mockMutateAsync.mockRejectedValueOnce(mockError);

    render(<UpdateArtworkForm artwork={mockArtwork} />, { wrapper });

    const form = reactScreen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
        }),
      );
    });
  });

  it("필수 필드가 비어있는 경우 제출 버튼이 비활성화됨", async () => {
    render(<UpdateArtworkForm artwork={mockArtwork} />, { wrapper });

    const koTitleInput = reactScreen.getByPlaceholderText("작품 제목(한국어)");
    await userEvent.clear(koTitleInput);

    expect(
      reactScreen.getByRole("button", { name: "작품 수정" }),
    ).toBeDisabled();
  });

  it("플랫폼 선택이 올바르게 동작함", async () => {
    render(<UpdateArtworkForm artwork={mockArtwork} />, { wrapper });

    // 플랫폼 셀렉트의 값이 "Steam"인 콤보박스 찾기
    const combobox = reactScreen
      .getAllByRole("combobox")
      .find((el) => el.textContent?.includes("Steam"));

    expect(combobox).toBeDefined();
    if (!combobox) return; // TypeScript를 위한 가드

    await userEvent.click(combobox);

    const switchOption = reactScreen.getByRole("option", { name: "Switch" });
    await userEvent.click(switchOption);

    expect(combobox).toHaveTextContent("Switch");
  });
});
