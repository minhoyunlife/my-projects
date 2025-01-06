import { EntityManager } from 'typeorm';

import { TransactionalRepository } from '@/src/common/repositories/transactional.repository';
import { Artwork } from '@/src/modules/artworks/artworks.entity';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';

describeWithoutDeps('TransactionalRepository', () => {
  describe('forTransaction()', () => {
    let mockArtworkRepository: Partial<TransactionalRepository<Artwork>>;
    let mockGenreRepository: Partial<TransactionalRepository<Genre>>;

    const mockEntityManager: Partial<EntityManager> = {
      transaction: vi.fn().mockImplementation(async (callback) => {
        try {
          await callback(mockEntityManager as EntityManager);
        } catch (error) {
          throw error;
        }
      }),
    };

    const mockArtworkSave = vi.fn();
    const mockGenreSave = vi.fn();

    beforeEach(() => {
      vi.clearAllMocks();

      mockArtworkRepository = {
        forTransaction: vi.fn().mockImplementation(() => ({
          save: mockArtworkSave,
          manager: mockEntityManager,
        })),
      };

      mockGenreRepository = {
        forTransaction: vi.fn().mockImplementation(() => ({
          save: mockGenreSave,
          manager: mockEntityManager,
        })),
      };
    });

    it('트랜잭션용 엔티티 매니저를 주입해서 리포지토리를 생성 가능함', async () => {
      await mockEntityManager.transaction(async (entityManager) => {
        const txRepo = mockArtworkRepository.forTransaction(entityManager);

        expect(txRepo.manager).toBe(entityManager);
      });
    });

    it('트랜잭션 내 작업 중에 하나가 실패하면 오류가 발생함', async () => {
      mockArtworkSave.mockResolvedValueOnce({});
      mockGenreSave.mockRejectedValueOnce(new Error('Save failed'));

      await expect(
        mockEntityManager.transaction(async (entityManager) => {
          const txArtworkRepo =
            mockArtworkRepository.forTransaction(entityManager);
          const txGenreRepo = mockGenreRepository.forTransaction(entityManager);

          await txArtworkRepo.save({ title: 'Test Artwork' });
          await txGenreRepo.save({
            translations: [
              { language: 'ko', name: '테스트 장르' },
              { language: 'en', name: 'Test Genre' },
              { language: 'ja', name: 'テストジャンル' },
            ] as GenreTranslation[],
          });
        }),
      ).rejects.toThrow('Save failed');

      expect(mockEntityManager.transaction).toBeCalled();
      expect(mockArtworkSave).toBeCalled();
      expect(mockGenreSave).toBeCalled();
    });
  });
});
