import { Platform } from '@/src/common/enums/platform.enum';
import { Artwork } from '@/src/modules/artworks/artworks.entity';
import { Genre } from '@/src/modules/genres/genres.entity';

export class ArtworksFactory {
  static createTestData(
    override: Partial<Artwork> = {},
    genres: Genre[] = [],
  ): Partial<Artwork> {
    return {
      title: '테스트 작품',
      imageUrl: 'https://example.com/image.jpg',
      createdAt: new Date('2024-11-01'),
      playedOn: Platform.STEAM,
      rating: 10,
      shortReview: '재미있는 게임이었습니다.',
      genres,
      ...override,
    };
  }
}
