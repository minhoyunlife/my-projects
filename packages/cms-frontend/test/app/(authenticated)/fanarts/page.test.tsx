import { GetArtworksSortEnum } from "@minhoyunlife/my-ts-client";

import FanartsListPage from "@/src/app/(authenticated)/fanarts/page";

const mockUseArtworkQuery = vi.fn();
vi.mock("@/src/hooks/artworks/use-artwork-query", () => ({
  useArtworkQuery: (params: any) => mockUseArtworkQuery(params),
}));

const mockUseGenreSearchQuery = vi.fn();
vi.mock("@/src/hooks/genres/use-genre-search-query", () => ({
  useGenreSearchQuery: (params: any) => mockUseGenreSearchQuery(params),
}));

const mockToast = vi.fn();
vi.mock("@/src/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/src/components/(authenticated)/page-wrapper", () => ({
  PageWrapper: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => (
    <div>
      <h2>{title}</h2>
      {children}
    </div>
  ),
}));

describe("FanartsListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseArtworkQuery.mockReturnValue({
      data: {
        data: {
          items: [],
          metadata: {
            totalPages: 1,
            currentPage: 1,
          },
        },
      },
      isLoading: false,
      error: null,
    });

    mockUseGenreSearchQuery.mockReturnValue({
      data: {
        data: {
          items: [],
        },
      },
      isLoading: false,
      error: null,
    });
  });

  describe("화면 렌더링 검증", () => {
    describe("기본 화면 요소", () => {
      it("제목, 필터, 테이블이 표시됨", () => {
        render(<FanartsListPage />);

        expect(reactScreen.getByRole("heading")).toHaveTextContent(
          "팬아트 작품 목록",
        );

        expect(
          reactScreen.getByPlaceholderText("작품 제목 검색..."),
        ).toBeInTheDocument();

        expect(
          reactScreen.getByRole("button", { name: "플랫폼" }),
        ).toBeInTheDocument();
        expect(
          reactScreen.getByRole("button", { name: "장르" }),
        ).toBeInTheDocument();
        expect(
          reactScreen.getByRole("button", { name: "상태" }),
        ).toBeInTheDocument();

        const sortSelect = reactScreen.getByRole("combobox");
        expect(sortSelect).toBeInTheDocument();
      });
    });

    describe("로딩 상태", () => {
      it("데이터 로딩 중에는 로딩 상태가 표시됨", () => {
        mockUseArtworkQuery.mockReturnValue({
          data: null,
          isLoading: true,
          error: null,
        });

        render(<FanartsListPage />);

        expect(
          reactScreen.getByTestId("data-table-skeleton"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("동작 검증", () => {
    describe("필터링 동작", () => {
      it("검색어 입력 시 API 파라미터가 갱신됨", () => {
        render(<FanartsListPage />);

        const searchInput =
          reactScreen.getByPlaceholderText("작품 제목 검색...");
        fireEvent.change(searchInput, { target: { value: "테스트" } });

        expect(mockUseArtworkQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "테스트",
            page: 1,
          }),
        );
      });

      it("플랫폼 선택 시 API 파라미터가 갱신됨", async () => {
        render(<FanartsListPage />);

        await userEvent.click(
          reactScreen.getByRole("button", { name: "플랫폼" }),
        );

        const steamOption = reactScreen.getByText("Steam");
        fireEvent.click(steamOption);

        expect(mockUseArtworkQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            platforms: ["Steam"],
            page: 1,
          }),
        );
      });

      it("장르 필터 선택 시 API 파라미터가 갱신됨", async () => {
        mockUseGenreSearchQuery.mockReturnValue({
          data: {
            data: {
              items: [
                {
                  id: "genre1",
                  translations: [{ language: "ko", name: "RPG" }],
                },
              ],
            },
          },
          isLoading: false,
        });

        render(<FanartsListPage />);

        await userEvent.click(
          reactScreen.getByRole("button", { name: "장르" }),
        );

        const searchInput = reactScreen.getByPlaceholderText("장르 검색...");
        await userEvent.type(searchInput, "RPG");

        const genreOption = await reactScreen.findByText("RPG");
        await userEvent.click(genreOption);

        expect(mockUseArtworkQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            genres: ["genre1"],
            page: 1,
          }),
        );
      });

      it("상태 필터 선택 시 API 파라미터가 갱신됨", async () => {
        render(<FanartsListPage />);

        await userEvent.click(
          reactScreen.getByRole("button", { name: "상태" }),
        );
        fireEvent.click(reactScreen.getByText("공개"));

        expect(mockUseArtworkQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            status: ["published"],
            page: 1,
          }),
        );
      });
    });

    describe("정렬 동작", () => {
      it("정렬 옵션 변경 시 API 파라미터가 갱신됨", async () => {
        render(<FanartsListPage />);

        const select = reactScreen.getByRole("combobox");
        await userEvent.click(select);

        const createdDescOption = reactScreen.getByRole("option", {
          name: "최신순",
        });
        await userEvent.click(createdDescOption);

        await waitFor(() => {
          expect(mockUseArtworkQuery).toHaveBeenCalledWith(
            expect.objectContaining({
              sort: GetArtworksSortEnum.CreatedDesc,
              page: 1,
            }),
          );
        });
      });
    });
  });

  describe("에러 처리 검증", () => {
    it("API 에러 발생 시 토스트 메시지가 표시됨", () => {
      mockUseArtworkQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("API Error"),
      });

      render(<FanartsListPage />);

      expect(mockToast).toHaveBeenCalled();
    });
  });
});
