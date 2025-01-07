import { ObjectLiteral } from 'typeorm';

export interface EntityList<T extends ObjectLiteral> {
  items: T[];
  totalCount: number;
}
