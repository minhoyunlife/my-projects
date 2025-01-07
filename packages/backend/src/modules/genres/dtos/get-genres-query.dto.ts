import { Transform } from 'class-transformer';
import { IsInt, IsOptional, MaxLength, Min, MinLength } from 'class-validator';

export class GetGenresQueryDto {
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
  @MinLength(1)
  @MaxLength(30)
  @Transform(({ value }) => value?.trim().replace(/\s+/g, ' '))
  search?: string;
}
