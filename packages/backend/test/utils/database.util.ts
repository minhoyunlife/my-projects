import { Type } from '@nestjs/common';

import { DataSource, DeepPartial, ObjectLiteral, Repository } from 'typeorm';

/**
 * 복수의 지정된 테스트 엔티티 데이터를 바탕으로 엔티티를 생성 후 DB에 저장
 * @param {Repository<T>} repository - 엔티티를 저장할 리포지토리
 * @param {Partial<T>[]} entities - 저장할 엔티티 목록
 * @returns {Promise<T[]>} 저장된 엔티티 목록
 */
export async function saveEntities<T extends ObjectLiteral>(
  repository: Repository<T>,
  entities: Partial<T>[],
): Promise<T[]> {
  const created = entities.map((entity) =>
    repository.create(entity as DeepPartial<T>),
  );
  return repository.save(created);
}

/**
 * 지정한 엔티티에 해당하는 데이터베이스 테이블을 truncate
 * @param {DataSource} dataSource - 데이터 소스
 * @param {Type<any>[]} entities - 대상 엔티티의 배열
 */
export async function clearTables(
  dataSource: DataSource,
  entities: Type<any>[],
) {
  for (const entity of entities) {
    const tableName = dataSource.getMetadata(entity).tableName;
    await dataSource.query(`TRUNCATE TABLE "${tableName}" CASCADE`);
  }
}
