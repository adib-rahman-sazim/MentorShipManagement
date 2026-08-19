import { Injectable } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import type { PaymentListResponse } from "../payments.dtos";
import type { IListPaymentsContext } from "../payments.interfaces";
import { PaymentsRepository } from "../payments.repository";
import { PaymentsSerializer } from "../payments.serializer";

@Injectable()
export class ListPaymentsInteractor
  implements IBaseInteractor<IListPaymentsContext, PaymentListResponse>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentsSerializer: PaymentsSerializer,
  ) {}

  async execute({ userId, query }: IListPaymentsContext): Promise<PaymentListResponse> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { payments, total } = await this.paymentsRepository.findAllPaginatedByUser({
      userId,
      page,
      limit,
    });
    const totalPages = Math.ceil(total / limit);

    return {
      data: this.paymentsSerializer.serializeMany(payments),
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }
}
