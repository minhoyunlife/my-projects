import { IsNotEmpty } from 'class-validator';

import { ValidatedString } from '@/src/common/decorators/validated-string.decorator';

export class CreateGenreDto {
  @IsNotEmpty()
  @ValidatedString({ minLength: 1, maxLength: 30 })
  koName: string;

  @IsNotEmpty()
  @ValidatedString({ minLength: 1, maxLength: 30 })
  enName: string;

  @IsNotEmpty()
  @ValidatedString({ minLength: 1, maxLength: 30 })
  jaName: string;
}
