import type { Artwork, Genre, TranslatedArtwork, TranslatedGenre } from '$lib/types/artwork';
import type { LanguageCode } from '$lib/types/languages';

export class TranslationService {
  /**
   * 지정한 언어에 맞게 여러 아트워크를 번역한 아트워크 데이터로 변환
   */
  translateArtworks(artworks: Artwork[], language: LanguageCode): TranslatedArtwork[] {
    return artworks.map((artwork) => this.translationArtwork(artwork, language));
  }

  private translationArtwork(artwork: Artwork, language: LanguageCode): TranslatedArtwork {
    const { translations, genres, ...rest } = artwork;
    const translated = {
      ...rest,
      title: '',
      shortReview: '',
      genres: genres ? genres.map((genre) => this.translateGenre(genre, language)) : []
    };

    const translation = translations.find((t) => t.language === language)!;
    translated.title = translation.title;
    translated.shortReview = translation.shortReview!;

    return translated;
  }

  private translateGenre(genre: Genre, language: LanguageCode): TranslatedGenre {
    const { translations, ...rest } = genre;
    const translated = { ...rest, name: '' };

    const translation = translations.find((t) => t.language === language)!;
    translated.name = translation.name;

    return translated;
  }
}

export const translationService = new TranslationService();
