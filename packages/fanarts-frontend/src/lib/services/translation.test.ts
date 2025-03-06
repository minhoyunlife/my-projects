import { TranslationService } from '$lib/services/translation';

import type { Artwork, TranslatedArtwork, TranslatedGenre } from '$lib/types/artwork';

describe('TranslationService', () => {
  let translationService: TranslationService;

  describe('translateArtworks', () => {
    const artworks: Artwork[] = [
      {
        id: '1',
        imageUrl: 'test.jpg',
        createdAt: '2024-01-01',
        translations: [
          { language: 'ko', title: '테스트', shortReview: '테스트' },
          { language: 'en', title: 'Test', shortReview: 'Test' }
        ],
        genres: [],
        rating: 0,
        isDraft: false,
        isVertical: false,
        playedOn: 'Steam'
      }
    ];

    it('작품 데이터를 번역한 작품 데이터로 변환함', () => {
      translationService = new TranslationService();

      const translated = translationService.translateArtworks(artworks, 'ko');

      expect(translated).toBeInstanceOf(Array<TranslatedArtwork>);
      expect(translated[0].title).toBe('테스트');
      expect(translated[0].shortReview).toEqual('테스트');
      expect(translated[0].genres).toBeInstanceOf(Array<TranslatedGenre>);
    });
  });
});
