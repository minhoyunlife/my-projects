import { Injectable } from '@nestjs/common';

import { BaseMapper } from '@/src/common/interfaces/base.mapper';
import { CreateArtworkDto } from '@/src/modules/artworks/dtos/create-artwork.dto';
import { UpdateArtworkDto } from '@/src/modules/artworks/dtos/update-artwork.dto';
import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { Language } from '@/src/modules/genres/enums/language.enum';

@Injectable()
export class ArtworksMapper
  implements BaseMapper<Artwork, CreateArtworkDto, UpdateArtworkDto>
{
  toEntityForCreate(createDto: CreateArtworkDto): Partial<Artwork> {
    return {
      imageKey: createDto.imageKey,
      createdAt: createDto.createdAt ? new Date(createDto.createdAt) : null,
      playedOn: createDto.playedOn,
      rating: createDto.rating,
      isDraft: true,
      isVertical: createDto.isVertical,
      genres: [],
      translations: [
        {
          language: Language.KO,
          title: createDto.koTitle,
          shortReview: createDto.koShortReview,
        },
        {
          language: Language.EN,
          title: createDto.enTitle,
          shortReview: createDto.enShortReview,
        },
        {
          language: Language.JA,
          title: createDto.jaTitle,
          shortReview: createDto.jaShortReview,
        },
      ] as ArtworkTranslation[],
    };
  }

  toEntityForUpdate(updateDto: UpdateArtworkDto, id: string): Partial<Artwork> {
    const translations = this.buildTranslations(updateDto);
    return {
      id,
      ...(translations.length > 0 && { translations }),
      ...(updateDto.createdAt && { createdAt: new Date(updateDto.createdAt) }),
      ...(updateDto.playedOn !== undefined && { playedOn: updateDto.playedOn }),
      ...(updateDto.rating !== undefined && { rating: updateDto.rating }),
    };
  }

  private buildTranslations(dto: UpdateArtworkDto): ArtworkTranslation[] {
    const translations: ArtworkTranslation[] = [];
    this.addTranslationIfNeeded(
      translations,
      Language.KO,
      dto.koTitle,
      dto.koShortReview,
    );
    this.addTranslationIfNeeded(
      translations,
      Language.EN,
      dto.enTitle,
      dto.enShortReview,
    );
    this.addTranslationIfNeeded(
      translations,
      Language.JA,
      dto.jaTitle,
      dto.jaShortReview,
    );

    return translations;
  }

  private addTranslationIfNeeded(
    translations: ArtworkTranslation[],
    language: Language,
    title?: string,
    shortReview?: string,
  ): void {
    if (title === undefined && shortReview === undefined) return;

    const translation = {
      language,
      ...(title !== undefined && { title }),
      ...(shortReview !== undefined && { shortReview }),
    } as ArtworkTranslation;

    translations.push(translation);
  }
}
