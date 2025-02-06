import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { NormalizeWhitespace } from '@/src/common/decorators/normalize-whitespace.decorator';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';

export class CreateArtworkDto {
  @NormalizeWhitespace()
  @IsNotEmpty()
  @IsString()
  imageKey: string;

  @NormalizeWhitespace()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  koTitle: string;

  @NormalizeWhitespace()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  enTitle: string;

  @NormalizeWhitespace()
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  jaTitle: string;

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

  @IsOptional()
  @NormalizeWhitespace()
  @IsString()
  @MaxLength(200)
  koShortReview?: string;

  @IsOptional()
  @NormalizeWhitespace()
  @IsString()
  @MaxLength(200)
  enShortReview?: string;

  @IsOptional()
  @NormalizeWhitespace()
  @IsString()
  @MaxLength(200)
  jaShortReview?: string;

  @IsArray()
  @IsString({ each: true })
  genreIds: string[];
}
