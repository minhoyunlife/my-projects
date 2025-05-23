import { Language } from '@/src/common/enums/language.enum';
import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';

export class ArtworkTranslationsFactory {
  static createTestData(
    override: Partial<ArtworkTranslation> = {},
  ): Partial<ArtworkTranslation> {
    return {
      language: Language.KO,
      title: '다크 소울 3',
      shortReview: '최고의 액션 RPG!',
      ...override,
    };
  }
}
