import { Transform } from 'class-transformer';

import { ValidatedStringArray } from '@/src/common/decorators/validated-array.decorator';

export class DeleteArtworksDto {
  @ValidatedStringArray({ notEmpty: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return [value].filter(Boolean);
    }
    return Array.isArray(value) ? value.filter(Boolean) : value;
  })
  ids: string[];
}
