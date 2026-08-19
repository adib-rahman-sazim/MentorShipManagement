import { Inject, Injectable } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import { PAYMENT_PROVIDER } from "../payments.constants";
import type { PriceListResponse } from "../payments.dtos";
import type { IPaymentProvider } from "../payments.interfaces";
import { PaymentsSerializer } from "../payments.serializer";

@Injectable()
export class GetPriceListInteractor implements IBaseInteractor<void, PriceListResponse> {
  constructor(
    @Inject(PAYMENT_PROVIDER)
    private readonly paymentProvider: IPaymentProvider,
    private readonly paymentsSerializer: PaymentsSerializer,
  ) {}

  async execute(): Promise<PriceListResponse> {
    const prices = await this.paymentProvider.getPriceList();
    return this.paymentsSerializer.serializePriceList(prices);
  }
}
