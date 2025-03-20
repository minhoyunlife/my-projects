import { IsDateString, IsEnum, IsOptional } from 'class-validator';

import { NormalizeWhitespace } from '@/src/common/decorators/normalize-whitespace.decorator';
import { ValidatedStringArray } from '@/src/common/decorators/validated-array.decorator';
import { ValidatedInt } from '@/src/common/decorators/validated-int.decorator';
import { ValidatedString } from '@/src/common/decorators/validated-string.decorator';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';

export class UpdateArtworkDto {
  @ValidatedString({ optional: true, minLength: 1, maxLength: 100 })
  koTitle?: string;

  @ValidatedString({ optional: true, minLength: 1, maxLength: 100 })
  enTitle?: string;

  @ValidatedString({ optional: true, minLength: 1, maxLength: 100 })
  jaTitle?: string;

  @IsOptional()
  @NormalizeWhitespace()
  @IsDateString()
  createdAt?: string;

  @IsOptional()
  @IsEnum(Platform)
  playedOn?: Platform;

  @ValidatedInt({ optional: true, min: 0, max: 20 })
  rating?: number;

  @ValidatedString({ optional: true, maxLength: 200 })
  koShortReview?: string;

  @ValidatedString({ optional: true, maxLength: 200 })
  enShortReview?: string;

  @ValidatedString({ optional: true, maxLength: 200 })
  jaShortReview?: string;

  @ValidatedStringArray({ optional: true })
  genreIds?: string[];
}
