import type { TransactionOptions } from "@mikro-orm/core";
import type { EntityManager, EntityName, QueryBuilder } from "@mikro-orm/postgresql";
import { EntityRepository } from "@mikro-orm/postgresql";

export class CustomSQLBaseRepository<Entity extends object> extends EntityRepository<Entity> {
  constructor(
    protected readonly em: EntityManager,
    protected readonly entityName: EntityName<Entity>,
  ) {
    super(em, entityName);
  }

  persist(entity: Entity, em: EntityManager = this.em): void {
    em.persist(entity);
  }

  persistMany(entities: Entity[], em: EntityManager = this.em): void {
    em.persist(entities);
  }

  remove(entity: Entity, em: EntityManager = this.em): void {
    em.remove(entity);
  }

  flush(em: EntityManager = this.em): Promise<void> {
    return em.flush();
  }

  transactional<T>(
    callback: (em: EntityManager) => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T> {
    return this.em.transactional(callback, options);
  }

  withEntityManager(em?: EntityManager): this {
    return this.getScopedRepository(em);
  }

  protected getScopedRepository(em?: EntityManager): this {
    return (em?.getRepository(this.entityName) as this | undefined) ?? this;
  }

  protected getScopedEntityManager(em?: EntityManager): EntityManager {
    return em ?? this.em;
  }

  protected retrievePaginatedRecordsByLimitAndOffset({
    qb,
    page = 1,
    limit = 10,
  }: {
    qb: QueryBuilder<Entity>;
    page?: number;
    limit?: number;
  }) {
    page = page < 1 ? 1 : page;
    limit = limit < 1 ? 1 : limit;

    qb.limit(limit).offset((page - 1) * limit);

    return qb.getResultAndCount();
  }
}
