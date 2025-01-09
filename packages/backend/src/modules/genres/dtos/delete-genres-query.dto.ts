import { Transform } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';

export class DeleteGenresQueryDto {
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
}
