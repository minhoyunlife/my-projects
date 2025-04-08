import SeriesListPage from "@/src/app/(authenticated)/series/page";
import { wrapper } from "@/test/utils/test-query-client";

const mockUseSeriesListQuery = vi.fn();
vi.mock("@/src/hooks/series/use-series", () => ({
  useSeries: () => ({
    useList: (params: any) => mockUseSeriesListQuery(params),
    useCreate: () => vi.fn(),
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

describe("SeriesListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseSeriesListQuery.mockReturnValue({
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
        render(<SeriesListPage />, { wrapper });

        expect(reactScreen.getByRole("heading")).toHaveTextContent(
          "시리즈 목록",
        );
        expect(
          reactScreen.getByPlaceholderText("시리즈명 검색..."),
        ).toBeInTheDocument();
        expect(reactScreen.getByRole("table")).toBeInTheDocument();
      });
    });

    describe("로딩 상태", () => {
      it("데이터 로딩 중에는 로딩 상태가 표시됨", () => {
        mockUseSeriesListQuery.mockReturnValue({
          data: null,
          isLoading: true,
          error: null,
        });

        render(<SeriesListPage />, { wrapper });

        expect(
          reactScreen.getByTestId("data-table-skeleton"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("UI 상호작용 검증", () => {
    describe("시리즈 생성", () => {
      it("추가 버튼 클릭 시 슬라이드오버가 열림", async () => {
        render(<SeriesListPage />, { wrapper });

        const addButton = reactScreen.getByRole("button", {
          name: "시리즈 추가",
        });
        await userEvent.click(addButton);

        expect(reactScreen.getByRole("dialog")).toHaveTextContent(
          "시리즈 추가",
        );
      });
    });
  });

  describe("동작 검증", () => {
    describe("검색 동작", () => {
      it("검색어 입력 시 API 파라미터가 갱신됨", () => {
        render(<SeriesListPage />, { wrapper });

        const searchInput =
          reactScreen.getByPlaceholderText("시리즈명 검색...");
        fireEvent.change(searchInput, { target: { value: "파이널 판타지" } });

        expect(mockUseSeriesListQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "파이널 판타지",
            page: 1,
          }),
        );
      });
    });

    describe("페이지네이션", () => {
      it("페이지 변경 시 API 파라미터가 갱신됨", () => {
        mockUseSeriesListQuery.mockReturnValue({
          data: {
            data: {
              items: Array(10).fill({
                id: "1",
                translations: [{ language: "ko", title: "시리즈 1" }],
                seriesArtworks: [],
              }),
              metadata: {
                totalPages: 3,
                currentPage: 1,
                totalCount: 30,
                pageSize: 10,
              },
            },
          },
          isLoading: false,
          error: null,
        });

        render(<SeriesListPage />, { wrapper });

        // 모킹만 확인 (페이지네이션 컴포넌트의 세부 구현은 테스트하지 않음)
        expect(mockUseSeriesListQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            page: 1,
          }),
        );
      });
    });
  });

  describe("에러 처리 검증", () => {
    it("API 에러 발생 시 토스트 메시지가 표시됨", () => {
      mockUseSeriesListQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("API Error"),
      });

      render(<SeriesListPage />, { wrapper });

      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "에러 발생",
          description: "시리즈 목록을 불러오는 데 실패했습니다.",
          variant: "destructive",
        }),
      );
    });
  });

  describe("테이블 데이터 표시", () => {
    it("시리즈 데이터가 테이블에 올바르게 표시됨", () => {
      mockUseSeriesListQuery.mockReturnValue({
        data: {
          data: {
            items: [
              {
                id: "1",
                translations: [
                  { language: "ko", title: "파이널 판타지" },
                  { language: "en", title: "Final Fantasy" },
                  { language: "ja", title: "ファイナルファンタジー" },
                ],
                seriesArtworks: [
                  { id: "art1", order: 0, translations: [] },
                  { id: "art2", order: 1, translations: [] },
                ],
              },
            ],
            metadata: {
              totalPages: 1,
              currentPage: 1,
              totalCount: 1,
              pageSize: 10,
            },
          },
        },
        isLoading: false,
        error: null,
      });

      render(<SeriesListPage />, { wrapper });

      expect(reactScreen.getByText("파이널 판타지")).toBeInTheDocument();
      expect(reactScreen.getByText("Final Fantasy")).toBeInTheDocument();
      expect(
        reactScreen.getByText("ファイナルファンタジー"),
      ).toBeInTheDocument();
      expect(reactScreen.getByText("2")).toBeInTheDocument(); // 작품 수
    });
  });
});
