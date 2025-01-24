import { Injectable } from '@nestjs/common';

import { EntityManager, In } from 'typeorm';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { EntityList } from '@/src/common/interfaces/entity-list.interface';
import { withRetry } from '@/src/common/utils/retry.util';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { GetArtworksQueryDto } from '@/src/modules/artworks/dtos/get-artworks-query.dto';
import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { SortType } from '@/src/modules/artworks/enums/sort-type.enum';
import { Status } from '@/src/modules/artworks/enums/status.enum';
import {
  ArtworkErrorCode,
  ArtworkException,
} from '@/src/modules/artworks/exceptions/artworks.exception';
import { Language } from '@/src/modules/genres/enums/language.enum';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { ImageStatus } from '@/src/modules/storage/enums/status.enum';
import { StorageService } from '@/src/modules/storage/storage.service';

@Injectable()
export class ArtworksService {
  constructor(
    private readonly artworksRepository: ArtworksRepository,
    private readonly genresRepository: GenresRepository,
    private readonly storageService: StorageService,
    private readonly entityManager: EntityManager,
  ) {}

  /**
   * 작품 목록을 쿼리의 조건에 맞춰서 조회
   *
   * @param query 작품 목록을 조회하기 위한 쿼리 정보
   * @param query.page 페이지 번호 (기본값: 1)
   * @param query.sort 정렬 방식 (undefined: 최신순)
   * @param query.platforms 플랫폼 필터 (빈 배열 또는 undefined: 모든 플랫폼)
   * @param query.genres 장르명 필터 (빈 배열 또는 undefined: 모든 장르)
   * @param query.search 제목 검색어
   * @param query.status 상태 필터 (인증된 경우에만 적용)
   *                     - 빈 배열 또는 undefined: 모든 상태
   *                     - DRAFT: 비공개만
   *                     - PUBLISHED: 공개만
   *                     - DRAFT, PUBLISHED: 모든 상태
   * @param isAuthenticated 인증 여부
   *                       - true: CMS 접근 (페이지당 10개, 상태 필터 적용)
   *                       - false: 일반 접근 (페이지당 20개, 공개 작품만 표시)
   * @returns 작품 목록과 총 작품 수
   */
  async getArtworks(
    query: GetArtworksQueryDto,
    isAuthenticated: boolean,
  ): Promise<EntityList<Artwork>> {
    const page = query.page ?? 1; // 페이지 번호(디폴트: 1)
    const pageSize = isAuthenticated ? PAGE_SIZE.CMS : PAGE_SIZE.PUBLIC; // 페이지 당 표시 작품 수(CMS: 10, 팬아트: 20)
    const sort = query.sort ?? SortType.CREATED_DESC; // 정렬 방식(디폴트: 작성일자 기준 최신순)
    const platforms = query.platforms?.length ? query.platforms : undefined; // 플랫폼 필터(디폴트: 모든 플랫폼)
    const genreIds = query.genreIds?.length ? query.genreIds : undefined;
    const search = query.search ?? undefined; // 제목 검색어(디폴트: 없음)

    // 작품 상태 필터
    // - 비인증: 항상 공개된 작품만([false])
    // - 인증 + status 미지정: 모든 상태([true, false])
    // - 인증 + status 지정: 지정된 상태만 필터링
    let statusFilter = isAuthenticated ? [true, false] : [false];
    if (isAuthenticated && query.status?.length) {
      statusFilter = Array.from(
        new Set(query.status.map((status) => status === Status.DRAFT)),
      );
    }

    const [items, totalCount] = await this.artworksRepository.getAllWithFilters(
      {
        page,
        pageSize,
        sort,
        platforms,
        genreIds,
        search,
        isDraftIn: statusFilter,
      },
    );

    return {
      items,
      totalCount,
    };
  }

  /**
   * 새로운 작품을 생성
   * @param dto 새로운 작품을 생성하기 위한 정보를 포함하는 DTO
   * @returns 생성된 작품
   */
  async createArtwork(dto: CreateArtworkDto): Promise<Artwork> {
    return this.entityManager.transaction(async (manager) => {
      const genres = await this.genresRepository.findBy({
        id: In(dto.genreIds),
      });
      if (genres.length !== dto.genreIds.length) {
        const existingGenreIds = new Set(genres.map((genre) => genre.id));
        const notExistingIds = dto.genreIds.filter(
          (id) => !existingGenreIds.has(id),
        );

        throw new ArtworkException(
          ArtworkErrorCode.NOT_EXISTING_GENRES_INCLUDED,
          "Some of the provided genres don't exist in DB",
          {
            genreIds: notExistingIds,
          },
        );
      }

      const artwork: Partial<Artwork> = {
        imageKey: dto.imageKey,
        createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
        playedOn: dto.playedOn,
        rating: dto.rating,
        isDraft: true, // 작품 생성 시에는 무조건 초안 상태
        genres: genres,
        translations: [
          {
            language: Language.KO,
            title: dto.koTitle,
            shortReview: dto.koShortReview,
          },
          {
            language: Language.EN,
            title: dto.enTitle,
            shortReview: dto.enShortReview,
          },
          {
            language: Language.JA,
            title: dto.jaTitle,
            shortReview: dto.jaShortReview,
          },
        ] as ArtworkTranslation[],
      };

      return await this.artworksRepository.createOne(artwork);
    });
  }

  /**
   * 복수의 기존 작품을 삭제
   * @param id - 삭제할 작품의 ID
   */
  async deleteArtworks(ids: string[]): Promise<void> {
    return this.entityManager.transaction(async (manager) => {
      const artworksTxRepo = this.artworksRepository.forTransaction(manager);
      const deletedArtworks = await artworksTxRepo.deleteMany(ids);

      await Promise.all(
        deletedArtworks.map(async (artwork) => {
          try {
            await withRetry(
              () =>
                this.storageService.changeImageTag(
                  artwork.imageKey,
                  ImageStatus.TO_DELETE,
                ),
              {
                onError: (error, attempt) => {
                  console.error(
                    `Failed to change image tag of artwork ${artwork.id} (attempt: ${attempt})`,
                    error,
                  );
                },
              },
            );
          } catch (error) {
            // 이미지 태그 변경 실패는 로그만 남기고 무시
            console.error(
              `Failed to change image tag of artwork ${artwork.id} after all retries`,
              error,
            );
          }
        }),
      );
    });
  }
}
