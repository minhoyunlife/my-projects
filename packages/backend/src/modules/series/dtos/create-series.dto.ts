import { IsNotEmpty } from 'class-validator';

import { ValidatedString } from '@/src/common/decorators/validated-string.decorator';

export class CreateSeriesDto {
  @IsNotEmpty()
  @ValidatedString({ minLength: 1, maxLength: 100 })
  koTitle: string;

  @IsNotEmpty()
  @ValidatedString({ minLength: 1, maxLength: 100 })
  enTitle: string;

  @IsNotEmpty()
  @ValidatedString({ minLength: 1, maxLength: 100 })
  jaTitle: string;
}
