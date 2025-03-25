import { SelectQueryBuilder } from 'typeorm';

import { Artwork } from '@/src/modules/artworks/entities/artworks.entity';

interface SortStrategy {
  readonly value: string;
  apply(query: SelectQueryBuilder<Artwork>): void;
}

class CreatedDescStrategy implements SortStrategy {
  readonly value = 'created_desc';

  apply(query: SelectQueryBuilder<Artwork>) {
    query.orderBy('artwork.createdAt', 'DESC');
  }
}

class CreatedAscStrategy implements SortStrategy {
  readonly value = 'created_asc';

  apply(query: SelectQueryBuilder<Artwork>): void {
    query.orderBy('artwork.createdAt', 'ASC');
  }
}

class RatingDescStrategy implements SortStrategy {
  readonly value = 'rating_desc';

  apply(query: SelectQueryBuilder<Artwork>): void {
    query.orderBy('artwork.rating', 'DESC');
  }
}

class RatingAscStrategy implements SortStrategy {
  readonly value = 'rating_asc';

  apply(query: SelectQueryBuilder<Artwork>): void {
    query.orderBy('artwork.rating', 'ASC');
  }
}

export class Sort {
  private constructor(private readonly strategy: SortStrategy) {}

  static readonly CREATED_DESC = new Sort(new CreatedDescStrategy());
  static readonly CREATED_ASC = new Sort(new CreatedAscStrategy());
  static readonly RATING_DESC = new Sort(new RatingDescStrategy());
  static readonly RATING_ASC = new Sort(new RatingAscStrategy());

  static fromString(value: string): Sort {
    const sortMap: Record<string, Sort> = {
      [Sort.CREATED_DESC.strategy.value]: Sort.CREATED_DESC,
      [Sort.CREATED_ASC.strategy.value]: Sort.CREATED_ASC,
      [Sort.RATING_DESC.strategy.value]: Sort.RATING_DESC,
      [Sort.RATING_ASC.strategy.value]: Sort.RATING_ASC,
    };
    return sortMap[value] || Sort.CREATED_DESC;
  }

  static all(): Sort[] {
    return [
      Sort.CREATED_DESC,
      Sort.CREATED_ASC,
      Sort.RATING_DESC,
      Sort.RATING_ASC,
    ];
  }

  static allValues(): string[] {
    return Sort.all().map((sort) => sort.strategy.value);
  }

  toString(): string {
    return this.strategy.value;
  }

  apply(query: SelectQueryBuilder<Artwork>): void {
    this.strategy.apply(query);
  }
}
