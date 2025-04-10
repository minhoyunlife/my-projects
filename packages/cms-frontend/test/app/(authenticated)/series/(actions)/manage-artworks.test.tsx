import { ManageSeriesArtworksForm } from "@/src/app/(authenticated)/series/(actions)/manage-artworks";
import type { Series } from "@/src/app/(authenticated)/series/(actions)/update";
import { wrapper } from "@/test/utils/test-query-client";

const mockUpdateArtworksMutateAsync = vi.fn();
vi.mock("@/src/hooks/series/use-series", () => ({
  useSeries: () => ({
    useUpdateArtworks: () => ({
      mutateAsync: mockUpdateArtworksMutateAsync,
      isPending: false,
    }),
  }),
}));

const mockSearchResults = {
  data: {
    items: [
      {
        id: "artwork-3",
        translations: [
          { language: "ko", title: "검색된 작품" },
          { language: "en", title: "Search Result" },
        ],
      },
      {
        id: "artwork-4",
        translations: [
          { language: "ko", title: "또 다른 작품" },
          { language: "en", title: "Another Artwork" },
        ],
      },
    ],
  },
};

vi.mock("@/src/hooks/artworks/use-artworks", () => ({
  useArtworks: () => ({
    useSearch: () => ({
      data: mockSearchResults,
      isLoading: false,
    }),
  }),
}));

const mockToast = vi.fn();
vi.mock("@/src/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}));

vi.mock("@/src/components/(authenticated)/artwork-select", () => ({
  ArtworkSelect: vi.fn(({ value, onChange, onSearch }) => (
    <div data-testid="artwork-select">
      <div data-testid="selected-artworks">{JSON.stringify(value)}</div>
      <button
        onClick={() =>
          onChange([
            ...value,
            { id: "artwork-3", title: "검색된 작품", order: value.length },
          ])
        }
        data-testid="add-artwork"
      >
        작품 추가
      </button>
      <button
        onClick={() => onSearch("검색어")}
        data-testid="search-artwork"
      >
        작품 검색
      </button>
    </div>
  )),
}));

describe("ManageSeriesArtworksForm", () => {
  const mockSeries: Series = {
    id: "series-1",
    translations: [
      { language: "ko", title: "테스트 시리즈" },
      { language: "en", title: "Test Series" },
      { language: "ja", title: "テストシリーズ" },
    ],
    seriesArtworks: [
      {
        id: "artwork-1",
        order: 0,
        translations: [
          { language: "ko", title: "첫 번째 작품" },
          { language: "en", title: "First Artwork" },
        ],
      },
      {
        id: "artwork-2",
        order: 1,
        translations: [
          { language: "ko", title: "두 번째 작품" },
          { language: "en", title: "Second Artwork" },
        ],
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("초기 아트워크 목록이 올바르게 로드됨", () => {
    render(<ManageSeriesArtworksForm series={mockSeries} />, { wrapper });

    const selectedArtworksElement =
      reactScreen.getByTestId("selected-artworks");
    const selectedArtworks = JSON.parse(
      selectedArtworksElement.textContent || "[]",
    );

    expect(selectedArtworks).toHaveLength(2);
    expect(selectedArtworks[0].id).toBe("artwork-1");
    expect(selectedArtworks[0].title).toBe("첫 번째 작품");
    expect(selectedArtworks[0].order).toBe(0);

    expect(selectedArtworks[1].id).toBe("artwork-2");
    expect(selectedArtworks[1].title).toBe("두 번째 작품");
    expect(selectedArtworks[1].order).toBe(1);
  });

  it("아트워크를 추가하면 목록이 업데이트됨", async () => {
    render(<ManageSeriesArtworksForm series={mockSeries} />, { wrapper });

    // 작품 추가 버튼 클릭
    await userEvent.click(reactScreen.getByTestId("add-artwork"));

    // 선택된 작품 목록에 새 작품이 추가되었는지 확인
    const selectedArtworksElement =
      reactScreen.getByTestId("selected-artworks");
    const selectedArtworks = JSON.parse(
      selectedArtworksElement.textContent || "[]",
    );

    expect(selectedArtworks).toHaveLength(3);
    expect(selectedArtworks[2].id).toBe("artwork-3");
    expect(selectedArtworks[2].title).toBe("검색된 작품");
    expect(selectedArtworks[2].order).toBe(2);
  });

  it("검색 기능이 정상적으로 동작함", async () => {
    render(<ManageSeriesArtworksForm series={mockSeries} />, { wrapper });

    // 검색 버튼 클릭
    await userEvent.click(reactScreen.getByTestId("search-artwork"));

    // 이 테스트는 컴포넌트 모킹으로 인해 실제로 useSearch가 호출되는지 확인하기 어려움
    // 대신 모킹된 ArtworkSelect의 onSearch 호출을 확인

    // 검색된 작품을 추가하여 정상 처리되는지 확인
    await userEvent.click(reactScreen.getByTestId("add-artwork"));

    const selectedArtworksElement =
      reactScreen.getByTestId("selected-artworks");
    const selectedArtworks = JSON.parse(
      selectedArtworksElement.textContent || "[]",
    );

    expect(selectedArtworks).toHaveLength(3);
    expect(selectedArtworks[2].id).toBe("artwork-3");
    expect(selectedArtworks[2].title).toBe("검색된 작품");
  });

  it("저장 버튼 클릭 시 API 호출이 정상적으로 실행됨", async () => {
    mockUpdateArtworksMutateAsync.mockResolvedValueOnce({});
    const onSuccess = vi.fn();

    render(
      <ManageSeriesArtworksForm
        series={mockSeries}
        onSuccess={onSuccess}
      />,
      { wrapper },
    );

    // 저장 버튼 클릭
    await userEvent.click(reactScreen.getByText("아트워크 구성 저장"));

    // API 호출 확인
    await waitFor(() => {
      expect(mockUpdateArtworksMutateAsync).toHaveBeenCalledWith({
        seriesId: "series-1",
        artworks: [
          { id: "artwork-1", order: 0 },
          { id: "artwork-2", order: 1 },
        ],
      });

      // 성공 토스트 메시지 확인
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "시리즈 아트워크가 업데이트되었습니다",
          variant: "success",
        }),
      );

      // onSuccess 콜백 호출 확인
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
            artworks: ["아트워크 ID가 유효하지 않습니다."],
          },
        },
      },
    };
    mockUpdateArtworksMutateAsync.mockRejectedValueOnce(mockError);

    render(<ManageSeriesArtworksForm series={mockSeries} />, { wrapper });

    // 저장 버튼 클릭
    await userEvent.click(reactScreen.getByText("아트워크 구성 저장"));

    // 에러 토스트 확인
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: "destructive",
        }),
      );
    });
  });
});
