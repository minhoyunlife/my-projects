import { artworkService } from '$lib/services/artwork';
import { translationService } from '$lib/services/translation';

import { ArtworkState } from '$lib/states/artwork.svelte';
import type {
  Artwork,
  ArtworkResponse,
  TranslatedArtwork,
  TranslatedGenre
} from '$lib/types/artwork';
import type { LanguageCode } from '$lib/types/languages';

vi.mock('$lib/services/artwork', () => ({
  artworkService: {
    getArtworks: vi.fn()
  }
}));

vi.mock('$lib/services/translation', () => ({
  translationService: {
    translateArtworks: vi.fn()
  }
}));

vi.mock('$lib/states/language.svelte', () => ({
  languageState: {
    currentLanguage: 'ko'
  }
}));

describe('ArtworkState', () => {
  let artworkState: ArtworkState;
  const testDate = new Date().toISOString();

  const mockArtworks1: Artwork[] = [
    {
      id: '1',
      imageUrl: 'image1.jpg',
      isVertical: false,
      translations: [
        { language: 'ko', title: '작품 1', shortReview: '리뷰 1' },
        { language: 'en', title: 'Artwork 1', shortReview: 'Review 1' }
      ],
      genres: [],
      createdAt: testDate,
      rating: 0,
      isDraft: false,
      playedOn: 'Steam'
    },
    {
      id: '2',
      imageUrl: 'image2.jpg',
      isVertical: true,
      translations: [
        { language: 'ko', title: '작품 2', shortReview: '리뷰 2' },
        { language: 'en', title: 'Artwork 2', shortReview: 'Review 2' }
      ],
      genres: [],
      createdAt: testDate,
      rating: 0,
      isDraft: false,
      playedOn: 'Steam'
    }
  ];

  const mockArtworks2: Artwork[] = [
    {
      id: '3',
      imageUrl: 'image3.jpg',
      isVertical: false,
      translations: [
        { language: 'ko', title: '작품 3', shortReview: '리뷰 3' },
        { language: 'en', title: 'Artwork 3', shortReview: 'Review 3' }
      ],
      genres: [],
      createdAt: testDate,
      rating: 0,
      isDraft: false,
      playedOn: 'Steam'
    },
    {
      id: '4',
      imageUrl: 'image4.jpg',
      isVertical: true,
      translations: [
        { language: 'ko', title: '작품 4', shortReview: '리뷰 4' },
        { language: 'en', title: 'Artwork 4', shortReview: 'Review 4' }
      ],
      genres: [],
      createdAt: testDate,
      rating: 0,
      isDraft: false,
      playedOn: 'Steam'
    }
  ];

  const mockResponse1: ArtworkResponse = {
    items: mockArtworks1,
    metadata: {
      totalCount: 4,
      totalPages: 2,
      currentPage: 1,
      pageSize: 2
    }
  };

  const mockResponse2: ArtworkResponse = {
    items: mockArtworks2,
    metadata: {
      totalCount: 4,
      totalPages: 2,
      currentPage: 2,
      pageSize: 2
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(translationService.translateArtworks).mockImplementation(
      (artworks: Artwork[], language: LanguageCode) => {
        return artworks.map((artwork) => {
          const translation = artwork.translations?.find((t) => t.language === language);

          return {
            id: artwork.id,
            imageUrl: artwork.imageUrl,
            isVertical: artwork.isVertical,
            title: translation!.title,
            shortReview: translation!.shortReview,
            genres: [] as TranslatedGenre[],
            createdAt: artwork.createdAt,
            rating: artwork.rating,
            isDraft: artwork.isDraft,
            playedOn: artwork.playedOn
          } as TranslatedArtwork;
        });
      }
    );

    vi.mocked(artworkService.getArtworks).mockResolvedValue(mockResponse1);

    artworkState = new ArtworkState();
  });

  describe('initialize', () => {
    it('제공된 데이터로 초기화를 수행함', () => {
      artworkState.initialize(mockResponse1);

      expect(translationService.translateArtworks).toHaveBeenCalledWith(mockArtworks1, 'ko');
      expect(artworkState.currentIndex).toBe(0);
      expect(artworkState.isFirstItem).toBe(true);
      expect(artworkState.isLastItem).toBe(false);
      expect(artworkState.isLoading).toBe(false);
    });
  });

  describe('goToNextPage', () => {
    beforeEach(() => {
      artworkState.initialize(mockResponse1);

      vi.mocked(artworkService.getArtworks).mockResolvedValueOnce(mockResponse2);
    });

    it('현재 인덱스를 증가시킴', async () => {
      await artworkState.goToNextPage();

      expect(artworkState.currentIndex).toBe(1);
    });

    it('현 페이지의 마지막 인덱스에 도달 시 다음 페이지를 불러옴', async () => {
      await artworkState.goToNextPage();
      await artworkState.goToNextPage();

      expect(artworkService.getArtworks).toHaveBeenCalledWith(2);
    });
  });

  describe('goToPrevPage', () => {
    beforeEach(() => {
      artworkState.initialize({
        ...mockResponse1,
        metadata: { ...mockResponse1.metadata, currentPage: 2 }
      });

      vi.mocked(artworkService.getArtworks).mockResolvedValueOnce({
        ...mockResponse1,
        metadata: { ...mockResponse1.metadata, currentPage: 1 }
      });
    });

    it('현재 인덱스를 감소시킴', async () => {
      await artworkState.goToNextPage();
      expect(artworkState.currentIndex).toBe(1);

      await artworkState.goToPrevPage();
      expect(artworkState.currentIndex).toBe(0);
    });

    it('현 페이지의 최초 인덱스에 도달 시 이전 페이지를 불러옴', async () => {
      await artworkState.goToPrevPage();
      expect(artworkService.getArtworks).toHaveBeenCalledWith(1);
    });
  });

  describe('updateLanguage', () => {
    beforeEach(() => {
      artworkState.initialize(mockResponse1);
    });

    it('언어 변경 시 아이템을 해당 언어로 번역함', () => {
      artworkState.updateLanguage('en');

      expect(translationService.translateArtworks).toHaveBeenCalledWith(mockArtworks1, 'en');
    });
  });
});
