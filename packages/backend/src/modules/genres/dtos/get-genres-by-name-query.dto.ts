import { ValidatedString } from '@/src/common/decorators/validated-string.decorator';

export class GetGenresByNameQueryDto {
  @ValidatedString({ minLength: 1, maxLength: 30 })
  search: string;
}
