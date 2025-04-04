import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';

import { ValidatedInt } from '@/src/common/decorators/validated-int.decorator';
import { ValidatedString } from '@/src/common/decorators/validated-string.decorator';

export class SeriesArtworkItemDto {
  @ValidatedString({ minLength: 1 })
  id: string;

  @ValidatedInt({ min: 0 })
  order: number;
}

export class UpdateSeriesArtworksDto {
  @ValidateNested({ each: true })
  @Type(() => SeriesArtworkItemDto)
  artworks: SeriesArtworkItemDto[];
}
