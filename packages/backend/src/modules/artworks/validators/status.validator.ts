import { Injectable } from '@nestjs/common';

import { addErrorMessages } from '@/src/common/exceptions/base.exception';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { StatusError } from '@/src/modules/artworks/enums/status-error.enum';
import {
  CreatedAtMustBeSetRule,
  GenresMustExistRule,
  PlayedOnMustBeSetRule,
  RatingMustBeInRangeRule,
  RatingMustBeSetRule,
  ShortReviewsMustBeSetRule,
} from '@/src/modules/artworks/validators/rules/status-change.rule';
import { Language } from '@/src/modules/genres/enums/language.enum';

export interface ValidationResult {
  isValid: boolean;
  error?: {
    code: string;
    field: string;
  };
}

@Injectable()
export class StatusValidator {
  private rules = [
    new CreatedAtMustBeSetRule(),
    new PlayedOnMustBeSetRule(),
    new RatingMustBeSetRule(),
    new RatingMustBeInRangeRule(),
    new GenresMustExistRule(),
    new ShortReviewsMustBeSetRule(),
  ];

  validate(artwork: Artwork): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const rule of this.rules) {
      const result = rule.validate(artwork);
      if (!result.isValid && result.error) {
        results.push(result);
      }
    }

    return results;
  }

  formatErrors(
    artwork: Artwork,
    failures: ValidationResult[],
  ): Record<string, string[]> {
    const errorsByCode: Record<string, string[]> = {};

    const identifier =
      artwork.translations.find((t) => t.language === Language.KO)?.title ??
      artwork.id;

    failures.forEach((failure) => {
      if (!failure.error) return;

      if (!errorsByCode[failure.error.code]) {
        errorsByCode[failure.error.code] = [];
      }

      const fields = failure.error.field.split(',');
      fields.forEach((field) => {
        errorsByCode[failure.error!.code].push(`${identifier}|${field.trim()}`);
      });
    });

    return errorsByCode;
  }

  validateStatusChange(
    requestedIds: string[],
    artworks: Artwork[],
    setPublished: boolean,
  ): { idsToUpdate: string[]; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};
    const invalidIds = new Set<string>();

    this.detectMissingArtworkIds(requestedIds, artworks, errors);

    const artworksToUpdate = artworks.filter(
      (artwork) => artwork.isDraft === setPublished,
    );

    if (setPublished) {
      this.validateForPublishing(artworksToUpdate, invalidIds, errors);
    }

    const idsToUpdate = artworksToUpdate
      .filter((artwork) => !invalidIds.has(artwork.id))
      .map((artwork) => artwork.id);

    return { idsToUpdate, errors };
  }

  private detectMissingArtworkIds(
    requestedIds: string[],
    artworks: Artwork[],
    errors: Record<string, string[]>,
  ): Set<string> {
    const invalidIds = new Set<string>();
    const foundIds = new Set(artworks.map((artwork) => artwork.id));

    for (const id of requestedIds) {
      if (!foundIds.has(id)) {
        invalidIds.add(id);
        addErrorMessages(errors, StatusError.NOT_FOUND, [`${id}|id`]);
      }
    }

    return invalidIds;
  }

  private validateForPublishing(
    artworks: Artwork[],
    invalidIds: Set<string>,
    errors: Record<string, string[]>,
  ): void {
    for (const artwork of artworks) {
      const validationErrors = this.validate(artwork);

      if (validationErrors.length > 0) {
        invalidIds.add(artwork.id);

        const formattedErrors = this.formatErrors(artwork, validationErrors);

        for (const [code, messages] of Object.entries(formattedErrors)) {
          addErrorMessages(errors, code, messages);
        }
      }
    }
  }
}
