import GenresListPage from "@/src/app/(authenticated)/genres/page";
import { wrapper } from "@/test/utils/test-query-client";

const mockUseGenreListQuery = vi.fn();
vi.mock("@/src/hooks/genres/use-genres", () => ({
  useGenres: () => ({
    useList: (params: any) => mockUseGenreListQuery(params),
    useCreate: () => vi.fn(),
    useUpdate: () => vi.fn(),
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

  describe("UI 상호작용 검증", () => {
    describe("장르 생성", () => {
      it("추가 버튼 클릭 시 슬라이드오버가 열림", async () => {
        render(<GenresListPage />, { wrapper });

        const addButton = reactScreen.getByRole("button", {
          name: "장르 추가",
        });
        await userEvent.click(addButton);

        expect(reactScreen.getByRole("dialog")).toHaveTextContent("장르 추가");
      });
    });

    describe("장르 수정", () => {
      it("수정 메뉴 클릭 시 슬라이드오버가 열림", async () => {
        mockUseGenreListQuery.mockReturnValue({
          data: {
            data: {
              items: [
                {
                  id: "1",
                  translations: [
                    { language: "ko", name: "액션" },
                    { language: "en", name: "Action" },
                    { language: "ja", name: "アクション" },
                  ],
                },
              ],
              metadata: { totalPages: 1, currentPage: 1 },
            },
          },
          isLoading: false,
          error: null,
        });

        render(<GenresListPage />, { wrapper });

        const menuButton = reactScreen.getByLabelText("more");
        await userEvent.click(menuButton);

        const editButton = reactScreen.getByRole("menuitem", { name: /수정/i });
        await userEvent.click(editButton);

        expect(reactScreen.getByRole("dialog")).toHaveTextContent("장르 수정");
      });
    });

    describe("장르 삭제", () => {
      it("삭제 메뉴 클릭 시 확인 다이얼로그가 열림", async () => {
        mockUseGenreListQuery.mockReturnValue({
          data: {
            data: {
              items: [
                {
                  id: "1",
                  translations: [{ language: "ko", name: "액션" }],
                },
              ],
              metadata: { totalPages: 1, currentPage: 1 },
            },
          },
          isLoading: false,
          error: null,
        });

        render(<GenresListPage />, { wrapper });

        const menuButton = reactScreen.getByLabelText("more");
        await userEvent.click(menuButton);

        const deleteButton = reactScreen.getByRole("menuitem", {
          name: /삭제/i,
        });
        await userEvent.click(deleteButton);

        expect(reactScreen.getByRole("alertdialog")).toBeInTheDocument();
      });

      it("여러 행 선택 후 삭제 버튼 클릭 시 확인 다이얼로그가 열림", async () => {
        mockUseGenreListQuery.mockReturnValue({
          data: {
            data: {
              items: [
                { id: "1", translations: [{ language: "ko", name: "액션" }] },
                { id: "2", translations: [{ language: "ko", name: "RPG" }] },
              ],
              metadata: { totalPages: 1, currentPage: 1 },
            },
          },
          isLoading: false,
          error: null,
        });

        render(<GenresListPage />, { wrapper });

        const checkboxes = reactScreen.getAllByRole("checkbox");
        await userEvent.click(checkboxes[1]!); // 첫 번째 행 선택

        const deleteButton = reactScreen.getByRole("button", { name: /삭제/i });
        await userEvent.click(deleteButton);

        expect(reactScreen.getByRole("alertdialog")).toBeInTheDocument();
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
