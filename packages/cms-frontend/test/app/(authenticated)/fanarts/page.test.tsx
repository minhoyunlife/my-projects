import { GetArtworksSortEnum } from "@minhoyunlife/my-ts-client";

import FanartsListPage from "@/src/app/(authenticated)/fanarts/page";
import { wrapper } from "@/test/utils/test-query-client";

const mockUseArtworkListQuery = vi.fn();
vi.mock("@/src/hooks/artworks/use-artworks", () => ({
  useArtworks: () => ({
    useList: (params: any) => mockUseArtworkListQuery(params),
    useChangeStatus: () => vi.fn(),
    useDelete: () => vi.fn(),
  }),
}));

const mockUseGenreSearchQuery = vi.fn();
vi.mock("@/src/hooks/genres/use-genres", () => ({
  useGenres: () => ({
    useSearch: (params: any) => mockUseGenreSearchQuery(params),
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

describe("FanartsListPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseArtworkListQuery.mockReturnValue({
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
        render(<FanartsListPage />, { wrapper });

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

        expect(reactScreen.getByRole("table")).toBeInTheDocument();
      });
    });

    describe("로딩 상태", () => {
      it("데이터 로딩 중에는 로딩 상태가 표시됨", () => {
        mockUseArtworkListQuery.mockReturnValue({
          data: null,
          isLoading: true,
          error: null,
        });

        render(<FanartsListPage />, { wrapper });

        expect(
          reactScreen.getByTestId("data-table-skeleton"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("UI 상호작용 검증", () => {
    describe("작품 상태 변경", () => {
      it("상태 변경 메뉴 클릭 시 확인 다이얼로그가 열림", async () => {
        mockUseArtworkListQuery.mockReturnValue({
          data: {
            data: {
              items: [
                {
                  id: "1",
                  translations: [
                    {
                      language: "ko",
                      title: "다크 소울3",
                    },
                  ],
                  genres: [
                    {
                      id: "1",
                      translations: [{ language: "ko", name: "액션" }],
                    },
                  ],
                  isDraft: true,
                },
              ],
              metadata: { totalPages: 1, currentPage: 1 },
            },
          },
          isLoading: false,
          error: null,
        });

        render(<FanartsListPage />, { wrapper });

        const menuButton = reactScreen.getByLabelText("more");
        await userEvent.click(menuButton);

        const publishButton = reactScreen.getByRole("menuitem", {
          name: /공개/i,
        });
        await userEvent.click(publishButton);

        expect(reactScreen.getByRole("alertdialog")).toBeInTheDocument();
      });

      it("여러 행 선택 후 상태 변경 버튼 클릭 시 확인 다이얼로그가 열림", async () => {
        mockUseArtworkListQuery.mockReturnValue({
          data: {
            data: {
              items: [
                {
                  id: "1",
                  translations: [{ language: "ko", title: "엘든 링" }],
                  genres: [
                    {
                      id: "1",
                      translations: [{ language: "ko", name: "액션" }],
                    },
                  ],
                  isDraft: true,
                },
                {
                  id: "2",
                  translations: [{ language: "ko", title: "다크 소울3" }],
                  genres: [
                    {
                      id: "1",
                      translations: [{ language: "ko", name: "액션" }],
                    },
                  ],
                  isDraft: true,
                },
              ],
              metadata: { totalPages: 1, currentPage: 1 },
            },
          },
          isLoading: false,
          error: null,
        });

        render(<FanartsListPage />, { wrapper });

        const checkboxes = reactScreen.getAllByRole("checkbox");
        await userEvent.click(checkboxes[1]!); // 첫 번째 행 선택

        const actionBar = reactScreen.getByTestId("selection-action-bar");
        const publishButton = within(actionBar).getByRole("button", {
          name: "공개",
        });
        await userEvent.click(publishButton);

        expect(reactScreen.getByRole("alertdialog")).toBeInTheDocument();
        expect(reactScreen.getByText(/1개의 작품/)).toBeInTheDocument();
      });

      it("작품 상태에 따라 적절한 상태 변경 메뉴가 표시됨", async () => {
        mockUseArtworkListQuery.mockReturnValue({
          data: {
            data: {
              items: [
                {
                  id: "1",
                  translations: [{ language: "ko", title: "엘든 링" }],
                  genres: [
                    {
                      id: "1",
                      translations: [{ language: "ko", name: "액션" }],
                    },
                  ],
                  isDraft: true,
                },
              ],
              metadata: { totalPages: 1, currentPage: 1 },
            },
          },
          isLoading: false,
          error: null,
        });

        render(<FanartsListPage />, { wrapper });

        const menuButton = reactScreen.getByLabelText("more");
        await userEvent.click(menuButton);

        expect(
          reactScreen.getByRole("menuitem", { name: /공개/i }),
        ).toBeInTheDocument();
        expect(
          reactScreen.queryByRole("menuitem", { name: /비공개/i }),
        ).not.toBeInTheDocument();
      });
    });

    describe("작품 삭제", () => {
      it("삭제 메뉴 클릭 시 확인 다이얼로그가 열림", async () => {
        mockUseArtworkListQuery.mockReturnValue({
          data: {
            data: {
              items: [
                {
                  id: "1",
                  translations: [
                    {
                      language: "ko",
                      title: "다크 소울3",
                    },
                  ],
                  genres: [
                    {
                      id: "1",
                      translations: [{ language: "ko", name: "액션" }],
                    },
                  ],
                },
              ],
              metadata: { totalPages: 1, currentPage: 1 },
            },
          },
          isLoading: false,
          error: null,
        });

        render(<FanartsListPage />, { wrapper });

        const menuButton = reactScreen.getByLabelText("more");
        await userEvent.click(menuButton);

        const deleteButton = reactScreen.getByRole("menuitem", {
          name: /삭제/i,
        });
        await userEvent.click(deleteButton);

        expect(reactScreen.getByRole("alertdialog")).toBeInTheDocument();
      });

      it("여러 행 선택 후 삭제 버튼 클릭 시 확인 다이얼로그가 열림", async () => {
        mockUseArtworkListQuery.mockReturnValue({
          data: {
            data: {
              items: [
                {
                  id: "1",
                  translations: [{ language: "ko", title: "엘든 링" }],
                  genres: [
                    {
                      id: "1",
                      translations: [{ language: "ko", name: "액션" }],
                    },
                  ],
                },
                {
                  id: "2",
                  translations: [{ language: "ko", title: "다크 소울3" }],
                  genres: [
                    {
                      id: "1",
                      translations: [{ language: "ko", name: "액션" }],
                    },
                  ],
                },
              ],
              metadata: { totalPages: 1, currentPage: 1 },
            },
          },
          isLoading: false,
          error: null,
        });

        render(<FanartsListPage />, { wrapper });

        const checkboxes = reactScreen.getAllByRole("checkbox");
        await userEvent.click(checkboxes[1]!); // 첫 번째 행 선택

        const deleteButton = reactScreen.getByRole("button", { name: /삭제/i });
        await userEvent.click(deleteButton);

        expect(reactScreen.getByRole("alertdialog")).toBeInTheDocument();
      });
    });
  });

  describe("동작 검증", () => {
    describe("필터링 동작", () => {
      it("검색어 입력 시 API 파라미터가 갱신됨", () => {
        render(<FanartsListPage />, { wrapper });

        const searchInput =
          reactScreen.getByPlaceholderText("작품 제목 검색...");
        fireEvent.change(searchInput, { target: { value: "테스트" } });

        expect(mockUseArtworkListQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "테스트",
            page: 1,
          }),
        );
      });

      it("플랫폼 선택 시 API 파라미터가 갱신됨", async () => {
        render(<FanartsListPage />, { wrapper });

        await userEvent.click(
          reactScreen.getByRole("button", { name: "플랫폼" }),
        );

        const steamOption = reactScreen.getByText("Steam");
        fireEvent.click(steamOption);

        expect(mockUseArtworkListQuery).toHaveBeenCalledWith(
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

        render(<FanartsListPage />, { wrapper });

        await userEvent.click(
          reactScreen.getByRole("button", { name: "장르" }),
        );

        const searchInput = reactScreen.getByPlaceholderText("장르 검색...");
        await userEvent.type(searchInput, "RPG");

        const genreOption = await reactScreen.findByText("RPG");
        await userEvent.click(genreOption);

        expect(mockUseArtworkListQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            genres: ["genre1"],
            page: 1,
          }),
        );
      });

      it("상태 필터 선택 시 API 파라미터가 갱신됨", async () => {
        render(<FanartsListPage />, { wrapper });

        await userEvent.click(
          reactScreen.getByRole("button", { name: "상태" }),
        );
        fireEvent.click(reactScreen.getByText("공개"));

        expect(mockUseArtworkListQuery).toHaveBeenCalledWith(
          expect.objectContaining({
            status: ["published"],
            page: 1,
          }),
        );
      });
    });

    describe("정렬 동작", () => {
      it("정렬 옵션 변경 시 API 파라미터가 갱신됨", async () => {
        render(<FanartsListPage />, { wrapper });

        const select = reactScreen.getByRole("combobox");
        await userEvent.click(select);

        const createdDescOption = reactScreen.getByRole("option", {
          name: "최신순",
        });
        await userEvent.click(createdDescOption);

        await waitFor(() => {
          expect(mockUseArtworkListQuery).toHaveBeenCalledWith(
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
      mockUseArtworkListQuery.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error("API Error"),
      });

      render(<FanartsListPage />, { wrapper });

      expect(mockToast).toHaveBeenCalled();
    });
  });
});
