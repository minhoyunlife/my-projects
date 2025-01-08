import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

import { NormalizeWhitespace } from '@/src/common/decorators/normalize-whitespace.decorator';

export class UpdateGenreDto {
  @NormalizeWhitespace()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  koName?: string;

  @NormalizeWhitespace()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  enName?: string;

  @NormalizeWhitespace()
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  jaName?: string;
}
