import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { Genre } from '@/src/modules/genres/entities/genres.entity';

export class ArtworksFactory {
  static createTestData(
    override: Partial<Artwork> = {},
    translations: Partial<ArtworkTranslation>[] = [],
    genres: Genre[] = [],
  ): Partial<Artwork> {
    return {
      imageKey: 'artworks/2024/03/abc123def456',
      createdAt: new Date('2024-11-01'),
      playedOn: Platform.STEAM,
      rating: 10,
      isDraft: true,
      isVertical: false,
      translations: translations as ArtworkTranslation[],
      genres,
      ...override,
    };
  }
}
