import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { StatusError } from '@/src/modules/artworks/enums/status-error.enum';
import { ValidationResult } from '@/src/modules/artworks/validators/artwork-status.validator';

interface StatusChangeRule {
  validate(artwork: Artwork): ValidationResult;
}

export class CreatedAtMustBeSetRule implements StatusChangeRule {
  validate(artwork: Artwork): ValidationResult {
    if (!artwork.createdAt) {
      return {
        isValid: false,
        error: {
          code: StatusError.FIELD_REQUIRED,
          field: 'createdAt',
        },
      };
    }

    return { isValid: true };
  }
}

export class PlayedOnMustBeSetRule implements StatusChangeRule {
  validate(artwork: Artwork): ValidationResult {
    if (!artwork.playedOn) {
      return {
        isValid: false,
        error: {
          code: StatusError.FIELD_REQUIRED,
          field: 'playedOn',
        },
      };
    }

    return { isValid: true };
  }
}

export class RatingMustBeSetRule implements StatusChangeRule {
  validate(artwork: Artwork): ValidationResult {
    if (!artwork.rating) {
      return {
        isValid: false,
        error: {
          code: StatusError.FIELD_REQUIRED,
          field: 'rating',
        },
      };
    }

    return { isValid: true };
  }
}

export class RatingMustBeInRangeRule implements StatusChangeRule {
  validate(artwork: Artwork): ValidationResult {
    if (artwork.rating < 0 || artwork.rating > 20) {
      return {
        isValid: false,
        error: {
          code: StatusError.OUT_OF_RANGE,
          field: 'rating',
        },
      };
    }

    return { isValid: true };
  }
}

export class GenresMustExistRule implements StatusChangeRule {
  validate(artwork: Artwork): ValidationResult {
    if (!artwork.genres || artwork.genres.length === 0) {
      return {
        isValid: false,
        error: {
          code: StatusError.NOT_EXIST,
          field: 'genres',
        },
      };
    }

    return { isValid: true };
  }
}

export class ShortReviewsMustBeSetRule implements StatusChangeRule {
  validate(artwork: Artwork): ValidationResult {
    const missingReviews = artwork.translations
      .filter((t) => !t.shortReview?.trim())
      .map((t) => t.language);

    if (missingReviews.length > 0) {
      return {
        isValid: false,
        error: {
          code: StatusError.FIELD_REQUIRED,
          field: missingReviews
            .map((lang) => `translations.${lang}.shortReview`)
            .join(','),
        },
      };
    }

    return { isValid: true };
  }
}
