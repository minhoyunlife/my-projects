import { ValidatedString } from '@/src/common/decorators/validated-string.decorator';

export class UpdateSeriesDto {
  @ValidatedString({ optional: true, minLength: 1, maxLength: 100 })
  koTitle?: string;

  @ValidatedString({ optional: true, minLength: 1, maxLength: 100 })
  enTitle?: string;

  @ValidatedString({ optional: true, minLength: 1, maxLength: 100 })
  jaTitle?: string;
}
