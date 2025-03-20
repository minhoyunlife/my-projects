import { ValidatedString } from '@/src/common/decorators/validated-string.decorator';

export class UpdateGenreDto {
  @ValidatedString({ optional: true, minLength: 1, maxLength: 30 })
  koName?: string;

  @ValidatedString({ optional: true, minLength: 1, maxLength: 30 })
  enName?: string;

  @ValidatedString({ optional: true, minLength: 1, maxLength: 30 })
  jaName?: string;
}
