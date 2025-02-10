import { HttpStatus, Inject, Injectable } from '@nestjs/common';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { EntityManager, In } from 'typeorm';
import { Logger } from 'winston';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { addErrorMessages } from '@/src/common/exceptions/base.exception';
import { EntityList } from '@/src/common/interfaces/entity-list.interface';
import { withRetry } from '@/src/common/utils/retry.util';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { GetArtworksQueryDto } from '@/src/modules/artworks/dtos/get-artworks-query.dto';
import { UpdateArtworkDto } from '@/src/modules/artworks/dtos/update-artwork.dto';
import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { SortType } from '@/src/modules/artworks/enums/sort-type.enum';
import { StatusError } from '@/src/modules/artworks/enums/status-error.enum';
import { Status } from '@/src/modules/artworks/enums/status.enum';
import {
  ArtworkErrorCode,
  ArtworkException,
} from '@/src/modules/artworks/exceptions/artworks.exception';
import { StatusValidator } from '@/src/modules/artworks/validators/artwork-status.validator';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
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
    private readonly statusValidator: StatusValidator,
    private readonly entityManager: EntityManager,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
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
      const artworksTxRepo = this.artworksRepository.forTransaction(manager);
      const genresTxRepo = this.genresRepository.forTransaction(manager);

      const genres = await genresTxRepo.findBy({
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

      return await artworksTxRepo.createOne(artwork);
    });
  }

  /**
   * 작품을 수정
   * @param id 수정할 작품의 ID
   * @param dto 수정할 작품의 정보를 포함하는 DTO
   * @returns 수정된 작품
   */
  async updateArtwork(id: string, dto: UpdateArtworkDto): Promise<Artwork> {
    if (Object.values(dto).every((value) => value === undefined)) {
      throw new ArtworkException(
        ArtworkErrorCode.NO_DATA_PROVIDED,
        'At least one field must be provided to update artwork',
        {
          fields: ['At least one field is required to update artwork'],
        },
      );
    }

    return this.entityManager.transaction(async (manager) => {
      const artworksTxRepo = this.artworksRepository.forTransaction(manager);
      const genresTxRepo = this.genresRepository.forTransaction(manager);

      let genres: Genre[];
      if (dto.genreIds) {
        genres =
          dto.genreIds.length > 0
            ? await genresTxRepo.findByIds(dto.genreIds)
            : [];

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
      }

      let translations: ArtworkTranslation[] = [];
      if (dto.koTitle || dto.koShortReview) {
        translations.push({
          language: Language.KO,
          ...(dto.koTitle && { title: dto.koTitle }),
          ...((dto.koShortReview || dto.koShortReview === '') && {
            shortReview: dto.koShortReview,
          }),
        } as ArtworkTranslation); // 부분 수정이므로, 불가피하게 타입 단언을 수행. 리포지토리 층에서 갱신 대상과 원본을 머지하기 때문에 괜찮다고 판단함.
      }
      if (dto.enTitle || dto.enShortReview) {
        translations.push({
          language: Language.EN,
          ...(dto.enTitle && { title: dto.enTitle }),
          ...((dto.enShortReview || dto.enShortReview === '') && {
            shortReview: dto.enShortReview,
          }),
        } as ArtworkTranslation);
      }
      if (dto.jaTitle || dto.jaShortReview) {
        translations.push({
          language: Language.JA,
          ...(dto.jaTitle && { title: dto.jaTitle }),
          ...((dto.jaShortReview || dto.jaShortReview === '') && {
            shortReview: dto.jaShortReview,
          }),
        } as ArtworkTranslation);
      }

      const artworkData: Partial<Artwork> = {
        id,
        ...(translations.length > 0 && { translations }),
        ...(dto.genreIds && { genres }),
        ...(dto.createdAt && { createdAt: new Date(dto.createdAt) }),
        ...(dto.playedOn && { playedOn: dto.playedOn }),
        ...(dto.rating !== undefined && { rating: dto.rating }),
      };

      return artworksTxRepo.updateOne(artworkData);
    });
  }

  /**
   * 작품의 상태를 변경
   * @param ids 상태를 변경할 작품의 ID
   * @param setPublished 변경할 상태 값
   */
  async updateStatuses(ids: string[], setPublished: boolean): Promise<void> {
    const errorsByCode: Record<string, string[]> = {};
    const validationFailedIds = new Set<string>();

    const artworks = await this.artworksRepository.findManyWithDetails(ids);

    const foundIds = new Set(artworks.map((artwork) => artwork.id));
    ids.forEach((id) => {
      if (!foundIds.has(id)) {
        validationFailedIds.add(id);
        addErrorMessages(errorsByCode, StatusError.NOT_FOUND, [`${id}|id`]);
      }
    });

    const artworksToUpdate = artworks.filter(
      (artwork) => artwork.isDraft === setPublished,
    );

    if (setPublished) {
      for (const artwork of artworksToUpdate) {
        const validationErrors = this.statusValidator.validate(artwork);

        if (validationErrors.length > 0) {
          validationFailedIds.add(artwork.id);

          const formattedErrors = this.statusValidator.formatErrors(
            artwork,
            validationErrors,
          );
          Object.entries(formattedErrors).forEach(([code, messages]) => {
            addErrorMessages(errorsByCode, code, messages);
          });
        }
      }
    }

    const idsToUpdate = artworksToUpdate
      .filter((artwork) => !validationFailedIds.has(artwork.id))
      .map((artwork) => artwork.id);

    if (idsToUpdate.length > 0) {
      try {
        await this.artworksRepository.updateManyStatuses(
          idsToUpdate,
          setPublished,
        );
      } catch (error) {
        idsToUpdate.forEach((id) => {
          validationFailedIds.add(id);
          addErrorMessages(errorsByCode, StatusError.UNKNOWN_FAILURE, [
            `${id}|status`,
          ]);
        });
      }
    }

    if (Object.keys(errorsByCode).length > 0) {
      throw new ArtworkException(
        ArtworkErrorCode.SOME_FAILED,
        'Some status changes failed',
        errorsByCode,
      );
    }
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
                  this.logger.warn('Failed to change image tag', {
                    context: 'ArtworksService',
                    metadata: {
                      artworkId: artwork.id,
                      imageKey: artwork.imageKey,
                      attempt,
                      error: error.message,
                    },
                  });
                },
              },
            );
          } catch (error) {
            this.logger.error('Failed to change image tag after all retries', {
              context: 'ArtworksService',
              metadata: {
                artworkId: artwork.id,
                imageKey: artwork.imageKey,
                error: error.message,
                stack: error.stack,
              },
            });
          }
        }),
      );
    });
  }
}
