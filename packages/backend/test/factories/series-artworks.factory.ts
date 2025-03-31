import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { SeriesArtwork } from '@/src/modules/series/entities/series-artworks.entity';
import { Series } from '@/src/modules/series/entities/series.entity';

export class SeriesArtworksFactory {
  static createTestData(
    override: Partial<SeriesArtwork> = {},
    series: Partial<Series>,
    artwork: Partial<Artwork>,
  ): Partial<SeriesArtwork> {
    return {
      seriesId: series?.id,
      artworkId: artwork?.id,
      order: 0,
      series: series as Series,
      artwork: artwork as Artwork,
      ...override,
    };
  }
}
