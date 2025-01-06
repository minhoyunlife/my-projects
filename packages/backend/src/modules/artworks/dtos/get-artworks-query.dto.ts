import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { SortType } from '@/src/modules/artworks/enums/sort-type.enum';
import { Status } from '@/src/modules/artworks/enums/status.enum';

export class GetArtworksQueryDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => {
    if (!value && value !== 0) return undefined;

    const parsed = Number(value);
    return Number.isInteger(parsed) ? parsed : value;
  })
  page?: number;

  @IsOptional()
  @IsEnum(SortType)
  sort?: SortType = SortType.CREATED_DESC;

  @IsOptional()
  @IsArray()
  @IsEnum(Platform, { each: true })
  @Transform(({ value }) => {
    return Array.isArray(value) ? value : [value];
  })
  platforms?: Platform[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    return Array.isArray(value) ? value : [value];
  })
  genreIds?: string[];

  @IsOptional()
  @MinLength(1)
  @MaxLength(50)
  @Transform(({ value }) => value?.trim().replace(/\s+/g, ' '))
  search?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Status, { each: true })
  @Transform(({ value }) => {
    return Array.isArray(value) ? value : [value];
  })
  status?: Status[];
}
