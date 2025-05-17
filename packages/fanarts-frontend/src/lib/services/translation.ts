import type {
  Artwork,
  Genre,
  Series,
  TranslatedArtwork,
  TranslatedGenre,
  TranslatedSeries
} from '$lib/types/artwork';
import type { LanguageCode } from '$lib/types/languages';

export class TranslationService {
  /**
   * 지정한 언어에 맞게 여러 아트워크를 번역한 아트워크 데이터로 변환
   */
  translateArtworks(artworks: Artwork[], language: LanguageCode): TranslatedArtwork[] {
    return artworks.map((artwork) => this.translationArtwork(artwork, language));
  }

  private translationArtwork(artwork: Artwork, language: LanguageCode): TranslatedArtwork {
    const { translations, genres, series, ...rest } = artwork;
    const translated = {
      ...rest,
      title: '',
      shortReview: '',
      genres: genres ? genres.map((genre) => this.translateGenre(genre, language)) : [],
      series: series ? this.translateSeries(series, language) : undefined
    };

    const translation = translations.find((t) => t.language === language);
    if (translation) {
      translated.title = translation.title;
      translated.shortReview = translation.shortReview || '';
    } else if (translations.length > 0) {
      // 해당 언어의 번역이 없으면 첫 번째 번역을 사용
      translated.title = translations[0].title;
      translated.shortReview = translations[0].shortReview || '';
    }

    return translated;
  }

  private translateGenre(genre: Genre, language: LanguageCode): TranslatedGenre {
    const { translations, ...rest } = genre;
    const translated = { ...rest, name: '' };

    const translation = translations.find((t) => t.language === language);
    if (translation) {
      translated.name = translation.name;
    } else if (translations.length > 0) {
      // 해당 언어의 번역이 없으면 첫 번째 번역을 사용
      translated.name = translations[0].name;
    }

    return translated;
  }

  private translateSeries(series: Series, language: LanguageCode): TranslatedSeries {
    const { translations, ...rest } = series;
    const translated = { ...rest, name: '' };

    const translation = translations.find((t) => t.language === language);
    if (translation) {
      translated.name = translation.title;
    } else if (translations.length > 0) {
      // 해당 언어의 번역이 없으면 첫 번째 번역을 사용
      translated.name = translations[0].title;
    }

    return translated;
  }
}

export const translationService = new TranslationService();
