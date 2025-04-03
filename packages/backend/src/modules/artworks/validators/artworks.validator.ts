import { Injectable } from '@nestjs/common';

import { Language } from '@/src/common/enums/language.enum';
import { UpdateArtworkDto } from '@/src/modules/artworks/dtos/update-artwork.dto';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import {
  ArtworkErrorCode,
  ArtworkException,
} from '@/src/modules/artworks/exceptions/artworks.exception';
import { Genre } from '@/src/modules/genres/entities/genres.entity';

@Injectable()
export class ArtworksValidator {
  assertAllGenresExist(genres: Genre[], genreIds: string[]): void {
    if (genres.length === genreIds.length) return;

    throw new ArtworkException(
      ArtworkErrorCode.NOT_EXISTING_GENRES_INCLUDED,
      "Some of the provided genres don't exist in DB",
      {
        genreIds: genreIds.filter(
          (id) => !new Set(genres.map((genre) => genre.id)).has(id),
        ),
      },
    );
  }

  assertAtLeastOneFieldProvided(dto: UpdateArtworkDto): void {
    if (Object.values(dto).some((value) => value !== undefined)) return;

    throw new ArtworkException(
      ArtworkErrorCode.NO_DATA_PROVIDED,
      'At least one field must be provided to update artwork',
      {
        fields: ['At least one field is required to update artwork'],
      },
    );
  }

  assertNoErrorsExist(errors: Record<string, string[]>): void {
    if (Object.keys(errors).length === 0) return;

    throw new ArtworkException(
      ArtworkErrorCode.SOME_FAILED,
      'Some status changes failed',
      errors,
    );
  }

  assertArtworkExists(artwork: Artwork): void {
    if (artwork) return;

    throw new ArtworkException(
      ArtworkErrorCode.NOT_FOUND,
      'The artwork with the provided ID does not exist',
    );
  }

  assertArtworkDraft(artwork: Artwork): void {
    if (artwork.isDraft) return;

    throw new ArtworkException(
      ArtworkErrorCode.ALREADY_PUBLISHED,
      'Cannot update published artwork',
    );
  }

  assertAllProvidedArtworksExist(artworks: Artwork[], ids: string[]): void {
    if (artworks.length === ids.length) return;

    throw new ArtworkException(
      ArtworkErrorCode.NOT_FOUND,
      'Some of the provided artworks do not exist',
      {
        ids: ids.filter((id) => !new Set(artworks.map((a) => a.id)).has(id)),
      },
    );
  }

  assertAllArtworksDraft(artworks: Artwork[]): void {
    if (artworks.every((artwork) => artwork.isDraft)) return;

    throw new ArtworkException(
      ArtworkErrorCode.ALREADY_PUBLISHED,
      'Cannot delete published artworks',
      {
        titles: artworks
          .filter((artwork) => !artwork.isDraft)
          .map(
            (a) =>
              a.translations.find((t) => t.language === Language.KO)?.title,
          ),
      },
    );
  }
}
