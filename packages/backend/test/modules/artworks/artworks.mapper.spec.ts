import { ArtworksMapper } from '@/src/modules/artworks/artworks.mapper';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { UpdateArtworkDto } from '@/src/modules/artworks/dtos/update-artwork.dto';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { Language } from '@/src/modules/genres/enums/language.enum';

describeWithoutDeps('ArtworksMapper', () => {
  let mapper: ArtworksMapper;

  beforeEach(() => {
    mapper = new ArtworksMapper();
  });

  describe('toEntityForCreate', () => {
    it('모든 필드가 포함된 아트워크 엔티티 데이터를 생성함', () => {
      const createDto: CreateArtworkDto = {
        imageKey: 'image-key-123',
        isVertical: true,
        koTitle: '테스트 작품',
        enTitle: 'Test Artwork',
        jaTitle: 'テスト作品',
        createdAt: '2023-01-01T00:00:00Z',
        playedOn: Platform.STEAM,
        rating: 10,
        koShortReview: '좋은 작품입니다',
        enShortReview: 'Great artwork',
        jaShortReview: '素晴らしい作品です',
        genreIds: ['genre-1', 'genre-2'],
      };

      const result = mapper.toEntityForCreate(createDto);

      expect(result).toHaveProperty('imageKey', 'image-key-123');
      expect(result).toHaveProperty('isVertical', true);
      expect(result).toHaveProperty('createdAt');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toContain('2023-01-01');
      expect(result).toHaveProperty('playedOn', Platform.STEAM);
      expect(result).toHaveProperty('rating', 10);
      expect(result).toHaveProperty('isDraft', true);
      expect(result).toHaveProperty('genres', []);
      expect(result).toHaveProperty('translations');
      expect(result.translations).toHaveLength(3);

      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.KO,
          title: '테스트 작품',
          shortReview: '좋은 작품입니다',
        }),
      );

      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.EN,
          title: 'Test Artwork',
          shortReview: 'Great artwork',
        }),
      );

      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.JA,
          title: 'テスト作品',
          shortReview: '素晴らしい作品です',
        }),
      );
    });

    it('옵셔널 필드가 없는 경우에도 아트워크 엔티티를 생성함', () => {
      const createDto: CreateArtworkDto = {
        imageKey: 'image-key-123',
        isVertical: false,
        koTitle: '테스트 작품',
        enTitle: 'Test Artwork',
        jaTitle: 'テスト作品',
        genreIds: [],
      };

      const result = mapper.toEntityForCreate(createDto);

      expect(result).toHaveProperty('imageKey', 'image-key-123');
      expect(result).toHaveProperty('isVertical', false);
      expect(result).toHaveProperty('createdAt', null);
      expect(result).toHaveProperty('playedOn', undefined);
      expect(result).toHaveProperty('rating', undefined);
      expect(result).toHaveProperty('isDraft', true);
      expect(result).toHaveProperty('genres', []);

      expect(result.translations).toHaveLength(3);
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.KO,
          title: '테스트 작품',
          shortReview: undefined,
        }),
      );
    });
  });

  describe('toEntityForUpdate', () => {
    it('모든 필드가 포함된 업데이트 시 적절한 엔티티 데이터를 생성함', () => {
      const updateDto: UpdateArtworkDto = {
        koTitle: '수정된 작품',
        enTitle: 'Updated Artwork',
        jaTitle: '更新された作品',
        createdAt: '2023-02-01T00:00:00Z',
        playedOn: Platform.STEAM,
        rating: 15,
        koShortReview: '수정된 리뷰',
        enShortReview: 'Updated review',
        jaShortReview: '更新されたレビュー',
        genreIds: ['genre-3'],
      };
      const id = 'artwork-1';

      const result = mapper.toEntityForUpdate(updateDto, id);

      expect(result).toHaveProperty('id', id);
      expect(result).toHaveProperty('createdAt');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.createdAt.toISOString()).toContain('2023-02-01');
      expect(result).toHaveProperty('playedOn', Platform.STEAM);
      expect(result).toHaveProperty('rating', 15);
      expect(result).toHaveProperty('translations');
      expect(result.translations).toHaveLength(3);

      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.KO,
          title: '수정된 작품',
          shortReview: '수정된 리뷰',
        }),
      );
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.EN,
          title: 'Updated Artwork',
          shortReview: 'Updated review',
        }),
      );
      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.JA,
          title: '更新された作品',
          shortReview: '更新されたレビュー',
        }),
      );
    });

    it('일부 필드만 업데이트하는 경우 해당 필드만 포함된 엔티티 데이터를 생성함', () => {
      const updateDto: UpdateArtworkDto = {
        koTitle: '수정된 작품',
        rating: 15,
      };
      const id = 'artwork-1';

      const result = mapper.toEntityForUpdate(updateDto, id);

      expect(result).toHaveProperty('id', id);
      expect(result).not.toHaveProperty('createdAt');
      expect(result).not.toHaveProperty('playedOn');
      expect(result).toHaveProperty('rating', 15);
      expect(result).toHaveProperty('translations');
      expect(result.translations).toHaveLength(1);

      expect(result.translations).toContainEqual(
        expect.objectContaining({
          language: Language.KO,
          title: '수정된 작품',
        }),
      );

      expect(result.translations).not.toContainEqual(
        expect.objectContaining({
          language: Language.EN,
        }),
      );
      expect(result.translations).not.toContainEqual(
        expect.objectContaining({
          language: Language.JA,
        }),
      );
    });

    it('번역 데이터 없이 다른 필드만 업데이트하는 경우, 적절하게 엔티티 데이터를 생성함', () => {
      const updateDto: UpdateArtworkDto = {
        rating: 20,
        playedOn: Platform.STEAM,
      };
      const id = 'artwork-1';

      const result = mapper.toEntityForUpdate(updateDto, id);

      expect(result).toHaveProperty('id', id);
      expect(result).toHaveProperty('rating', 20);
      expect(result).toHaveProperty('playedOn', Platform.STEAM);
      expect(result).not.toHaveProperty('translations');
    });

    it('shortReview만 업데이트하는 경우, 적절하게 엔티티 데이터를 생성함', () => {
      const updateDto: UpdateArtworkDto = {
        koShortReview: '새로운 리뷰',
      };
      const id = 'artwork-1';

      const result = mapper.toEntityForUpdate(updateDto, id);

      expect(result).toHaveProperty('id', id);
      expect(result).toHaveProperty('translations');
      expect(result.translations).toHaveLength(1);
      expect(result.translations[0]).toEqual(
        expect.objectContaining({
          language: Language.KO,
          shortReview: '새로운 리뷰',
        }),
      );
      expect(result.translations[0]).not.toHaveProperty('title');
    });
  });
});
