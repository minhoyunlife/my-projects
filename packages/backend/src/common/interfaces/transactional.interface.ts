import { EntityManager } from 'typeorm';

export interface Transactional<T> {
  withTransaction(manager: EntityManager): T;
}
