import { Genre } from '@/src/modules/genres/genres.entity';

export class GenreResponse {
  id: string;
  name: string;

  constructor(genre: Genre) {
    this.id = genre.id;
    this.name = genre.name;
  }
}
