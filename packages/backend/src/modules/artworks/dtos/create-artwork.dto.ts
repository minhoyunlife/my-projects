import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
} from 'class-validator';

import { NormalizeWhitespace } from '@/src/common/decorators/normalize-whitespace.decorator';
import { Platform } from '@/src/common/enums/platform.enum';

export class CreateArtworkDto {
  @NormalizeWhitespace()
  @IsNotEmpty()
  @IsString()
  title: string;

  @NormalizeWhitespace()
  @IsNotEmpty()
  @IsUrl()
  imageUrl: string;

  @NormalizeWhitespace()
  @IsOptional()
  @IsDateString()
  createdAt?: string;

  @NormalizeWhitespace({ each: true })
  @IsArray()
  @IsString({ each: true })
  genres: string[] = [];

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
  @MinLength(1)
  shortReview?: string;
}
