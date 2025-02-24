import type { GetArtworks200Response } from '@minhoyunlife/my-ts-client';
import type { AxiosResponse } from 'axios';

import { ArtworkService } from '$lib/services/artwork';

import { artworksApi } from '$lib/config/api';
import { type SortOption, type Platform } from '$lib/types/artwork';

vi.mock('$lib/config/api', () => ({
  artworksApi: {
    getArtworks: vi.fn()
  }
}));

describe('ArtworkService', () => {
  let service: ArtworkService;

  const mockResponse = {
    data: {
      items: [
        {
          id: '1',
          imageUrl: 'test.jpg',
          createdAt: '2024-01-01',
          translations: [{ language: 'ko', title: '테스트' }],
          genres: []
        }
      ],
      metadata: {
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
        pageSize: 20
      }
    }
  } as unknown as AxiosResponse<GetArtworks200Response>;

  beforeEach(() => {
    service = new ArtworkService();
    vi.clearAllMocks();
  });

  it('파라미터를 지정해서 작품 목록을 가져옴', async () => {
    const page = 1;
    const sort = 'created-desc' as SortOption;
    const platforms = new Set(['Steam' as Platform]);
    const genreIds = new Set(['1']);
    vi.mocked(artworksApi.getArtworks).mockResolvedValue(mockResponse);

    await service.getArtworks(page, sort, platforms, genreIds);

    expect(artworksApi.getArtworks).toHaveBeenCalledWith(page, sort, platforms, genreIds);
  });

  it('API 호출에 실패할 경우, 에러가 발생함', async () => {
    const error = new Error('API Error');
    vi.mocked(artworksApi.getArtworks).mockRejectedValue(error);

    await expect(service.getArtworks()).rejects.toThrowError();
  });
});
