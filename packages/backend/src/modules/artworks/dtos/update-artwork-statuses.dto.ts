import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

import { ValidatedStringArray } from '@/src/common/decorators/validated-array.decorator';

export class UpdateArtworkStatusesDto {
  @ValidatedStringArray({ notEmpty: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value].filter(Boolean);
    }
    return Array.isArray(value) ? value.filter(Boolean) : value;
  })
  ids: string[];

  @IsBoolean()
  setPublished: boolean;
}
