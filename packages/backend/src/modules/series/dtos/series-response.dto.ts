import { SeriesArtwork } from '@/src/modules/series/entities/series-artworks.entity';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';
import { Series } from '@/src/modules/series/entities/series.entity';

export class SeriesResponseDto {
  id: string;
  translations: SeriesTranslation[];
  seriesArtworks: SeriesArtwork[];

  constructor(series: Series) {
    this.id = series.id;
    this.translations = series.translations ?? [];
    this.seriesArtworks = series.seriesArtworks ?? [];
  }
}
