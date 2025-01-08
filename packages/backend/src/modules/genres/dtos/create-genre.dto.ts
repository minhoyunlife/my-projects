import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import { NormalizeWhitespace } from '@/src/common/decorators/normalize-whitespace.decorator';

export class CreateGenreDto {
  @NormalizeWhitespace()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  koName: string;

  @NormalizeWhitespace()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  enName: string;

  @NormalizeWhitespace()
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(30)
  jaName: string;
}
