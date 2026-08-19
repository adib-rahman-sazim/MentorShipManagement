import {
  Entity,
  EntityRepositoryType,
  Enum,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  type Rel,
  Unique,
} from "@mikro-orm/core";

import { SubscriptionsRepository } from "@/modules/subscriptions/subscriptions.repository";

import { ESubscriptionStatus } from "../enums/subscriptions.enums";
import { CustomBaseEntity } from "./custom-base.entity";
import { User } from "./users.entity";

@Entity({
  tableName: "subscriptions",
  repository: () => SubscriptionsRepository,
})
@Unique({ properties: ["providerSubscriptionId", "customerId"] })
@Index({ properties: ["user", "priceId", "status"] })
export class Subscription extends CustomBaseEntity {
  [EntityRepositoryType]?: SubscriptionsRepository;

  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @Property({ fieldName: "provider_subscription_id" })
  providerSubscriptionId!: string;

  @Property({ fieldName: "customer_id" })
  customerId!: string;

  @Property({ fieldName: "price_id" })
  priceId!: string;

  @Property({ fieldName: "current_period_start_at" })
  currentPeriodStartAt!: Date;

  @Property({ fieldName: "current_period_end_at" })
  currentPeriodEndAt!: Date;

  @Property({ fieldName: "cancel_at_period_end" })
  cancelAtPeriodEnd: boolean = false;

  @Enum({ items: () => ESubscriptionStatus })
  status!: ESubscriptionStatus;

  @Property({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  @ManyToOne(() => User, { nullable: true })
  user!: Rel<User>;
}
