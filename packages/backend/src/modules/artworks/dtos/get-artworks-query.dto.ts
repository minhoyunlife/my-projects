import { Transform } from 'class-transformer';
import { IsIn, IsOptional, IsString } from 'class-validator';

import {
  ValidatedEnumArray,
  ValidatedStringArray,
} from '@/src/common/decorators/validated-array.decorator';
import { ValidatedInt } from '@/src/common/decorators/validated-int.decorator';
import { ValidatedString } from '@/src/common/decorators/validated-string.decorator';
import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { Sort } from '@/src/modules/artworks/enums/sort-type.enum';
import { Status } from '@/src/modules/artworks/enums/status.enum';

export class GetArtworksQueryDto {
  @ValidatedInt({ optional: true, min: 1 })
  @Transform(({ value }) => {
    if (!value && value !== 0) return undefined;

    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : value;
  })
  page?: number;

  @IsOptional()
  @IsIn(Sort.all())
  @Transform(({ value }) => {
    return Sort.fromString(value);
  })
  sort?: Sort = Sort.CREATED_DESC;

  @ValidatedEnumArray(Platform, { optional: true })
  @Transform(({ value }) => {
    return Array.isArray(value) ? value : [value];
  })
  platforms?: Platform[];

  @ValidatedStringArray({ optional: true })
  @Transform(({ value }) => {
    return Array.isArray(value) ? value : [value];
  })
  genreIds?: string[];

  @ValidatedString({ optional: true, minLength: 1, maxLength: 50 })
  search?: string;

  @ValidatedEnumArray(Status, { optional: true })
  @Transform(({ value }) => {
    return Array.isArray(value) ? value : [value];
  })
  status?: Status[];
}
