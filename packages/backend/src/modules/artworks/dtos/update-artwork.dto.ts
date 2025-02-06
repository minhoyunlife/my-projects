import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { NormalizeWhitespace } from '@/src/common/decorators/normalize-whitespace.decorator';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';

export class UpdateArtworkDto {
  @NormalizeWhitespace()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  koTitle?: string;

  @NormalizeWhitespace()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  enTitle?: string;

  @NormalizeWhitespace()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  jaTitle?: string;

  @NormalizeWhitespace()
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @IsOptional()
  @IsEnum(Platform)
  playedOn?: Platform;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(20)
  rating?: number;

  @NormalizeWhitespace()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  koShortReview?: string;

  @NormalizeWhitespace()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  enShortReview?: string;

  @NormalizeWhitespace()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  jaShortReview?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genreIds?: string[];
}
