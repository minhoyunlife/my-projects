import { ArtworkTranslation } from '@/src/modules/artworks/entities/artwork-translations.entity';
import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';
import { Administrator } from '@/src/modules/auth/entities/administrator.entity';
import { Totp } from '@/src/modules/auth/entities/totp.entity';
import { GenreTranslation } from '@/src/modules/genres/entities/genre-translations.entity';
import { Genre } from '@/src/modules/genres/entities/genres.entity';
import { SeriesArtwork } from '@/src/modules/series/entities/series-artworks.entity';
import { SeriesTranslation } from '@/src/modules/series/entities/series-translations.entity';
import { Series } from '@/src/modules/series/entities/series.entity';

export const TEST_DB_CONFIG = {
  type: 'postgres' as const, // DataSourceOption 에서 리터럴 타입을 기대
  host: 'localhost',
  port: 5433,
  username: 'postgres',
  password: 'password',
  database: 'test_db',
  entities: [
    // INFO: 엔티티가 추가될 때마다 여기에 추가할 것
    Administrator,
    Totp,
    Artwork,
    ArtworkTranslation,
    Genre,
    GenreTranslation,
    Series,
    SeriesTranslation,
    SeriesArtwork,
  ],
};

export const TEST_S3_CONFIG = {
  endpoint: 'http://localhost:4566',
  region: 'ap-northeast-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
  cloudfrontDomain: 'test.example.com',
  bucket: 'test-bucket',
  forcePathStyle: true,
};
