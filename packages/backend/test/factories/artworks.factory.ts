import { Artwork } from '@/src/modules/artworks/artworks.entity';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { Genre } from '@/src/modules/genres/entities/genres.entity';

export class ArtworksFactory {
  static createTestData(
    override: Partial<Artwork> = {},
    genres: Genre[] = [],
  ): Partial<Artwork> {
    return {
      title: '테스트 작품',
      imageKey: 'artworks/2024/03/abc123def456',
      createdAt: new Date('2024-11-01'),
      playedOn: Platform.STEAM,
      rating: 10,
      shortReview: '재미있는 게임이었습니다.',
      genres,
      ...override,
    };
  }
}
