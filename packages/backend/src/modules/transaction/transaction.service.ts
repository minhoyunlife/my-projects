import { Injectable } from '@nestjs/common';

import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class TransactionService {
  constructor(private readonly dataSource: DataSource) {}

  async executeInTransaction<T>(
    callback: (entityManager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(callback);
  }
}
