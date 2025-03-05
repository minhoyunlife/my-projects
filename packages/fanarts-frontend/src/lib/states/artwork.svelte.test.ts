import type { AxiosResponse } from 'axios';

import { ArtworkService } from '$lib/services/artwork';

import { artworksApi } from '$lib/config/api';
import { ArtworkState } from '$lib/states/artwork.svelte';
import { type ArtworkResponse } from '$lib/types/artwork';

vi.mock('$lib/config/api', () => ({
  artworksApi: {
    getArtworks: vi.fn()
  }
}));

describe('ArtworkState', () => {
  let artworkService: ArtworkService;
  let artworkState: ArtworkState;

  const mockResponse1: ArtworkResponse = {
    items: [
      {
        id: '1',
        imageUrl: 'image1.jpg',
        isVertical: false,
        translations: [],
        genres: [],
        createdAt: new Date().toISOString(),
        rating: 0,
        isDraft: false,
        playedOn: 'Steam'
      },
      {
        id: '2',
        imageUrl: 'image2.jpg',
        isVertical: true,
        translations: [],
        genres: [],
        createdAt: new Date().toISOString(),
        rating: 0,
        isDraft: false,
        playedOn: 'Steam'
      }
    ],
    metadata: {
      totalCount: 6,
      totalPages: 3,
      currentPage: 1,
      pageSize: 10
    }
  };

  const mockResponse2: ArtworkResponse = {
    items: [
      {
        id: '3',
        imageUrl: 'image3.jpg',
        isVertical: false,
        translations: [],
        genres: [],
        createdAt: new Date().toISOString(),
        rating: 0,
        isDraft: false,
        playedOn: 'Steam'
      },
      {
        id: '4',
        imageUrl: 'image4.jpg',
        isVertical: true,
        translations: [],
        genres: [],
        createdAt: new Date().toISOString(),
        rating: 0,
        isDraft: false,
        playedOn: 'Steam'
      }
    ],
    metadata: {
      totalCount: 6,
      totalPages: 3,
      currentPage: 2,
      pageSize: 10
    }
  };

  beforeEach(() => {
    vi.mocked(artworksApi.getArtworks).mockReset();

    vi.mocked(artworksApi.getArtworks).mockResolvedValue({
      data: mockResponse1
    } as AxiosResponse<ArtworkResponse>);

    artworkService = new ArtworkService();
    artworkState = new ArtworkState(artworkService);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('initialize', () => {
    it('제공된 데이터로 초기화를 수행함', () => {
      artworkState.initialize(mockResponse1);

      expect(artworkState.items).toHaveLength(2);
      expect(artworkState.currentIndex).toBe(0);
      expect(artworkState.isFirstItem).toBe(true);
      expect(artworkState.isLastItem).toBe(false);
      expect(artworkState.isLoading).toBe(false);
    });
  });

  describe('goToNextPage', () => {
    beforeEach(() => {
      artworkState.initialize(mockResponse1);

      vi.mocked(artworksApi.getArtworks).mockResolvedValue({
        data: mockResponse2
      } as AxiosResponse<ArtworkResponse>);
    });

    it('현재 인덱스를 증가시킴', async () => {
      await artworkState.goToNextPage();

      expect(artworkState.currentIndex).toBe(1);
    });

    it('현 페이지의 마지막 인덱스에 도달 시 다음 페이지를 불러옴', async () => {
      await artworkState.goToNextPage();
      await artworkState.goToNextPage();

      expect(artworksApi.getArtworks).toHaveBeenCalledWith(2, undefined, undefined, undefined);
      expect(artworkState.items).toHaveLength(4);
    });
  });

  describe('goToPrevPage', () => {
    beforeEach(() => {
      artworkState.initialize({
        ...mockResponse1,
        metadata: { ...mockResponse1.metadata, currentPage: 2 }
      });

      vi.mocked(artworksApi.getArtworks).mockResolvedValue({
        data: {
          ...mockResponse2,
          metadata: { ...mockResponse2.metadata, currentPage: 1 }
        }
      } as AxiosResponse<ArtworkResponse>);
    });

    it('현재 인덱스를 감소시킴', async () => {
      await artworkState.goToNextPage();
      expect(artworkState.currentIndex).toBe(1);

      await artworkState.goToPrevPage();
      expect(artworkState.currentIndex).toBe(0);
    });

    it('현 페이지의 최초 인덱스에 도달 시 이전 페이지를 불러옴', async () => {
      await artworkState.goToPrevPage();

      expect(artworksApi.getArtworks).toHaveBeenCalledWith(1, undefined, undefined, undefined);
    });
  });
});
