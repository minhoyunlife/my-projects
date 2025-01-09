import { IsString, MaxLength, MinLength } from 'class-validator';

import { NormalizeWhitespace } from '@/src/common/decorators/normalize-whitespace.decorator';

export class GetGenreNamesQueryDto {
  @NormalizeWhitespace()
  @IsString()
  @MinLength(1)
  @MaxLength(30)
  search: string;
}
