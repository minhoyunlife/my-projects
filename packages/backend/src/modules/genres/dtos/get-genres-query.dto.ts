import { Transform } from 'class-transformer';

import { ValidatedInt } from '@/src/common/decorators/validated-int.decorator';
import { ValidatedString } from '@/src/common/decorators/validated-string.decorator';

export class GetGenresQueryDto {
  @ValidatedInt({ optional: true, min: 1 })
  @Transform(({ value }) => {
    if (!value && value !== 0) return undefined;

    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : value;
  })
  page?: number;

  @ValidatedString({ optional: true, minLength: 1, maxLength: 30 })
  search?: string;
}
