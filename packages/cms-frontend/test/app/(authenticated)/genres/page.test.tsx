import GenresListPage from "@/src/app/(authenticated)/genres/page";
import { wrapper } from "@/test/utils/test-query-client";

const mockUseGenreListQuery = vi.fn();
vi.mock("@/src/hooks/genres/use-genres", () => ({
  useGenres: () => ({
    useList: (params: any) => mockUseGenreListQuery(params),
    useDelete: () => vi.fn(),
  }),
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

describe("GenresListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseGenreListQuery.mockReturnValue({
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
  });

  describe("화면 렌더링 검증", () => {
    describe("기본 화면 요소", () => {
      it("제목, 검색, 테이블이 표시됨", () => {
        render(<GenresListPage />, { wrapper });

        expect(reactScreen.getByRole("heading")).toHaveTextContent("장르 목록");
        expect(
          reactScreen.getByPlaceholderText("장르명 검색..."),
        ).toBeInTheDocument();
        expect(reactScreen.getByRole("table")).toBeInTheDocument();
      });
    });

    describe("로딩 상태", () => {
      it("데이터 로딩 중에는 로딩 상태가 표시됨", () => {
        mockUseGenreListQuery.mockReturnValue({
          data: null,
          isLoading: true,
          error: null,
        });

        render(<GenresListPage />, { wrapper });

        expect(
          reactScreen.getByTestId("data-table-skeleton"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("동작 검증", () => {
    describe("검색 동작", () => {
      it("검색어 입력 시 API 파라미터가 갱신됨", () => {
        render(<GenresListPage />, { wrapper });

        const searchInput = reactScreen.getByPlaceholderText("장르명 검색...");
        fireEvent.change(searchInput, { target: { value: "액션" } });

        expect(mockUseGenreListQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "액션",
            page: 1,
          }),
        );
      });
    });
  });

  describe("에러 처리 검증", () => {
    it("API 에러 발생 시 토스트 메시지가 표시됨", () => {
      mockUseGenreListQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("API Error"),
      });

      render(<GenresListPage />, { wrapper });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
        }),
      );
    });
  });
});
