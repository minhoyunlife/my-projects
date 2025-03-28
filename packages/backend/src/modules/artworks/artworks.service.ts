import { Inject, Injectable } from '@nestjs/common';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { PAGE_SIZE } from '@/src/common/constants/page-size.constant';
import { addErrorMessages } from '@/src/common/exceptions/base.exception';
import { EntityList } from '@/src/common/interfaces/entity-list.interface';
import { ArtworksMapper } from '@/src/modules/artworks/artworks.mapper';
import { ArtworksRepository } from '@/src/modules/artworks/artworks.repository';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { GetArtworksQueryDto } from '@/src/modules/artworks/dtos/get-artworks-query.dto';
import { UpdateArtworkDto } from '@/src/modules/artworks/dtos/update-artwork.dto';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { Sort } from '@/src/modules/artworks/enums/sort-type.enum';
import { StatusError } from '@/src/modules/artworks/enums/status-error.enum';
import { Status } from '@/src/modules/artworks/enums/status.enum';
import { ArtworkFilter } from '@/src/modules/artworks/interfaces/filter.interface';
import { ArtworksValidator } from '@/src/modules/artworks/validators/artworks.validator';
import { StatusValidator } from '@/src/modules/artworks/validators/status.validator';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { GenresRepository } from '@/src/modules/genres/genres.repository';
import { ImageStatus } from '@/src/modules/storage/enums/status.enum';
import { StorageService } from '@/src/modules/storage/storage.service';
import { TransactionService } from '@/src/modules/transaction/transaction.service';

@Injectable()
export class ArtworksService {
  constructor(
    private readonly artworksRepository: ArtworksRepository,
    private readonly genresRepository: GenresRepository,
    private readonly storageService: StorageService,
    private readonly statusValidator: StatusValidator,
    private readonly artworksValidator: ArtworksValidator,
    private readonly transactionService: TransactionService,
    private readonly artworksMapper: ArtworksMapper,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getArtworks(
    dto: GetArtworksQueryDto,
    isAuthenticated: boolean,
  ): Promise<EntityList<Artwork>> {
    const filters = this.buildArtworkFilters(dto, isAuthenticated);
    const [items, totalCount] =
      await this.artworksRepository.getAllWithFilters(filters);

    return {
      items,
      totalCount,
    };
  }

  async createArtwork(dto: CreateArtworkDto): Promise<Artwork> {
    return this.transactionService.executeInTransaction(async (manager) => {
      const artworksTxRepo = this.artworksRepository.withTransaction(manager);
      const genresTxRepo = this.genresRepository.withTransaction(manager);

      const genres = await this.findAndValidateGenres(
        genresTxRepo,
        dto.genreIds,
      );
      const artworkData = this.artworksMapper.toEntityForCreate(dto);
      artworkData.genres = genres;

      return await artworksTxRepo.createOne(artworkData);
    });
  }

  async updateArtwork(id: string, dto: UpdateArtworkDto): Promise<Artwork> {
    this.artworksValidator.assertAtLeastOneFieldProvided(dto);

    return this.transactionService.executeInTransaction(async (manager) => {
      const artworksTxRepo = this.artworksRepository.withTransaction(manager);
      const genresTxRepo = this.genresRepository.withTransaction(manager);

      const artwork = await artworksTxRepo.findOneWithDetails(id);
      this.artworksValidator.assertArtworkExists(artwork);
      this.artworksValidator.assertArtworkDraft(artwork);

      const genres = dto.genreIds
        ? await this.findAndValidateGenres(genresTxRepo, dto.genreIds)
        : undefined;
      const artworkData = this.artworksMapper.toEntityForUpdate(dto, id);
      if (genres) {
        artworkData.genres = genres;
      }

      return artworksTxRepo.updateOne(artworkData, artwork);
    });
  }

  async updateStatuses(ids: string[], setPublished: boolean): Promise<void> {
    const artworks = await this.artworksRepository.findManyWithDetails(ids);
    const { idsToUpdate, errors } = this.statusValidator.validateStatusChange(
      ids,
      artworks,
      setPublished,
    );

    await this.tryUpdateStatuses(idsToUpdate, setPublished, errors);

    this.artworksValidator.assertNoErrorsExist(errors);
  }

  async deleteArtworks(ids: string[]): Promise<void> {
    return this.transactionService.executeInTransaction(async (manager) => {
      const artworksTxRepo = this.artworksRepository.withTransaction(manager);

      const artworks = await artworksTxRepo.findManyWithDetails(ids);
      this.artworksValidator.assertAllProvidedArtworksExist(artworks, ids);
      this.artworksValidator.assertAllArtworksDraft(artworks);

      const deletedArtworks = await artworksTxRepo.deleteMany(artworks);
      this.markArtworkAsDeleted(deletedArtworks);
    });
  }

  private buildArtworkFilters(
    dto: GetArtworksQueryDto,
    isAuthenticated: boolean,
  ): ArtworkFilter {
    return {
      page: dto.page ?? 1,
      pageSize: isAuthenticated ? PAGE_SIZE.CMS : PAGE_SIZE.PUBLIC,
      sort: dto.sort ?? Sort.CREATED_DESC,
      platforms: dto.platforms?.length ? dto.platforms : undefined,
      genreIds: dto.genreIds?.length ? dto.genreIds : undefined,
      search: dto.search ?? undefined,
      isDraftIn: this.determineStatusFilter(dto.status, isAuthenticated),
    };
  }

  private determineStatusFilter(
    status: Status[] | undefined,
    isAuthenticated: boolean,
  ) {
    if (!isAuthenticated) return [false];
    return !status?.length
      ? [true, false]
      : Array.from(new Set(status.map((status) => status === Status.DRAFT)));
  }

  private async findAndValidateGenres(
    genresRepo: GenresRepository,
    genreIds: string[],
  ): Promise<Genre[]> {
    if (genreIds.length === 0) return [];

    const genres = await genresRepo.findByIds(genreIds);
    this.artworksValidator.assertAllGenresExist(genres, genreIds);

    return genres;
  }

  private async tryUpdateStatuses(
    ids: string[],
    setPublished: boolean,
    errors: Record<string, string[]>,
  ): Promise<void> {
    if (ids.length === 0) return;

    try {
      await this.artworksRepository.updateManyStatuses(ids, setPublished);
    } catch (error) {
      for (const id of ids) {
        addErrorMessages(errors, StatusError.UNKNOWN_FAILURE, [`${id}|status`]);
      }
    }
  }

  private async markArtworkAsDeleted(artworks: Artwork[]): Promise<void> {
    await Promise.all(
      artworks.map(async (artwork) => {
        try {
          await this.storageService.changeImageTag(
            artwork.imageKey,
            ImageStatus.TO_DELETE,
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
  }
}
