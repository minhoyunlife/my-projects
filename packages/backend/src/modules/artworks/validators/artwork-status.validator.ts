import { Injectable } from '@nestjs/common';

import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
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
}
