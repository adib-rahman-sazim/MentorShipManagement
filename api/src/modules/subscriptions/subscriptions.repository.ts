import { Injectable } from "@nestjs/common";

import { LockMode, type RequiredEntityData } from "@mikro-orm/core";
import type { EntityManager } from "@mikro-orm/postgresql";

import { Subscription } from "@/common/entities/subscriptions.entity";
import type { ESubscriptionStatus } from "@/common/enums/subscriptions.enums";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

@Injectable()
export class SubscriptionsRepository extends CustomSQLBaseRepository<Subscription> {
  findByProviderSubscriptionId(
    providerSubscriptionId: string,
    em?: EntityManager,
  ): Promise<Subscription | null> {
    return this.getScopedRepository(em).findOne({ providerSubscriptionId });
  }

  findByUserId(userId: string, em?: EntityManager): Promise<Subscription | null> {
    return this.getScopedRepository(em).findOne({ user: { id: userId } });
  }

  createSubscription(data: RequiredEntityData<Subscription>, em?: EntityManager): Subscription {
    return this.getScopedRepository(em).create(data);
  }

  findByUserIdWithStatuses(
    {
      userId,
      statuses,
    }: {
      userId: string;
      statuses: readonly ESubscriptionStatus[];
    },
    em?: EntityManager,
  ): Promise<Subscription | null> {
    return this.getScopedRepository(em).findOne({
      user: { id: userId },
      status: { $in: [...statuses] },
    });
  }

  findByProviderSubscriptionIdForUpdate(
    providerSubscriptionId: string,
    em?: EntityManager,
  ): Promise<Subscription | null> {
    return this.getScopedRepository(em).findOne(
      { providerSubscriptionId },
      { lockMode: LockMode.PESSIMISTIC_WRITE },
    );
  }
}
