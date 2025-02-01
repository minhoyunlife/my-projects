import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsBoolean, IsString } from 'class-validator';

export class UpdateArtworkStatusesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
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
