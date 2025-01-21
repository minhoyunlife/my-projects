import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
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
  @IsNotEmpty()
  @IsString()
  koTitle: string;

  @NormalizeWhitespace()
  @IsNotEmpty()
  @IsString()
  enTitle: string;

  @NormalizeWhitespace()
  @IsNotEmpty()
  @IsString()
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
  koShortReview?: string;

  @IsOptional()
  @NormalizeWhitespace()
  @IsString()
  enShortReview?: string;

  @IsOptional()
  @NormalizeWhitespace()
  @IsString()
  jaShortReview?: string;

  @IsArray()
  @IsString({ each: true })
  genreIds: string[];
}
