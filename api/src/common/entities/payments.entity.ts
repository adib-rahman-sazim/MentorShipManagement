import {
  Entity,
  EntityRepositoryType,
  Enum,
  Index,
  ManyToOne,
  PrimaryKey,
  Property,
  type Rel,
} from "@mikro-orm/core";

import { PaymentsRepository } from "@/modules/payments/payments.repository";

import {
  EPaymentCurrency,
  EPaymentProvider,
  EPaymentStatus,
  EPaymentType,
} from "../enums/payments.enums";
import { CustomBaseEntity } from "./custom-base.entity";
import { Subscription } from "./subscriptions.entity";
import { User } from "./users.entity";

@Entity({
  tableName: "payments",
  repository: () => PaymentsRepository,
})
@Index({ properties: ["user", "createdAt"] })
export class Payment extends CustomBaseEntity {
  [EntityRepositoryType]?: PaymentsRepository;

  @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
  id!: string;

  @Enum({ items: () => EPaymentType })
  type!: EPaymentType;

  @Property({ fieldName: "external_id", unique: true })
  externalId!: string;

  @ManyToOne(() => Subscription, { nullable: true })
  subscription?: Rel<Subscription> | null;

  @Property({ fieldName: "product_id", nullable: true })
  productId?: string;

  @Property({ fieldName: "price_id", nullable: true })
  priceId?: string;

  @Property({ nullable: true })
  quantity?: number;

  @Enum({ items: () => EPaymentProvider })
  provider!: EPaymentProvider;

  @Property({ type: "int" })
  amount!: number;

  @Enum({ items: () => EPaymentCurrency })
  currency!: EPaymentCurrency;

  @Property({ nullable: true })
  description?: string;

  @Enum({ items: () => EPaymentStatus })
  status: EPaymentStatus = EPaymentStatus.PENDING;

  @Property({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown>;

  @ManyToOne(() => User)
  user!: Rel<User>;
}
