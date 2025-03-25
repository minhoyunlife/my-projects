import { Platform } from '@/src/modules/artworks/enums/platform.enum';
import { Sort } from '@/src/modules/artworks/enums/sort-type.enum';

export interface ArtworkFilter {
  page: number;
  pageSize: number;
  sort: Sort;
  platforms?: Platform[];
  genreIds?: string[];
  search?: string;
  isDraftIn: boolean[];
}
