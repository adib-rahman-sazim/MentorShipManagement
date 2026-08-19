import { Injectable } from "@nestjs/common";

import type { RequiredEntityData } from "@mikro-orm/core";
import type { EntityManager } from "@mikro-orm/postgresql";

import { Payment } from "@/common/entities/payments.entity";
import { EPaymentStatus, EPaymentType } from "@/common/enums/payments.enums";
import { CustomSQLBaseRepository } from "@/common/repository/custom-sql-base.repository";

@Injectable()
export class PaymentsRepository extends CustomSQLBaseRepository<Payment> {
  findByExternalId(externalId: string, em?: EntityManager): Promise<Payment | null> {
    return this.getScopedRepository(em).findOne({ externalId });
  }

  findPendingRecurringByUserId(userId: string, em?: EntityManager): Promise<Payment | null> {
    return this.getScopedRepository(em).findOne({
      user: { id: userId },
      status: EPaymentStatus.PENDING,
      type: EPaymentType.RECURRING,
    });
  }

  createPayment(data: RequiredEntityData<Payment>, em?: EntityManager): Payment {
    return this.getScopedRepository(em).create(data);
  }

  async findAllPaginatedByUser(
    {
      userId,
      page,
      limit,
    }: {
      userId: string;
      page: number;
      limit: number;
    },
    em?: EntityManager,
  ): Promise<{ payments: Payment[]; total: number }> {
    const [payments, total] = await this.getScopedRepository(em).findAndCount(
      { user: { id: userId } },
      {
        limit,
        offset: (page - 1) * limit,
        orderBy: { createdAt: "DESC" },
      },
    );

    return { payments, total };
  }
}
