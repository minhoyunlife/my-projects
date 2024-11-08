import { EntityManager, ObjectType, Repository } from 'typeorm';

/**
 * 트랜잭션용 리포지토리 클래스
 * @template T - 엔티티 타입
 */
export abstract class TransactionalRepository<T> extends Repository<T> {
  protected constructor(
    protected readonly entityClass: ObjectType<T>,
    repository: Repository<T>,
  ) {
    super(repository.target, repository.manager, repository.queryRunner);
  }

  /**
   * 트랜잭션용 리포지토리 인스턴스를 반환하기 위한 세컨드 컨스트럭터
   * (이 확장클래스를 이용하는 각 리포지토리에서 처리를 구체화할 것)
   * @param {EntityManager} entityManager - 엔티티 매니저
   * @returns {TransactionalRepository<T>} - 트랜잭션용 리포지토리 인스턴스
   */
  abstract forTransaction(
    entityManager: EntityManager,
  ): TransactionalRepository<T>;
}
