import type { RawBodyRequest } from "@nestjs/common";
import { Injectable } from "@nestjs/common";

import { CreateCheckoutSessionInteractor } from "./interactors/create-checkout-session.interactor";
import { GetPriceListInteractor } from "./interactors/get-price-list.interactor";
import { HandlePaymentWebhookInteractor } from "./interactors/handle-payment-webhook.interactor";
import { ListPaymentsInteractor } from "./interactors/list-payments.interactor";
import type {
  CheckoutSessionResponse,
  CreateCheckoutSessionDto,
  ListPaymentsQueryDto,
  PaymentListResponse,
  PriceListResponse,
} from "./payments.dtos";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly getPriceListInteractor: GetPriceListInteractor,
    private readonly createCheckoutSessionInteractor: CreateCheckoutSessionInteractor,
    private readonly listPaymentsInteractor: ListPaymentsInteractor,
    private readonly handlePaymentWebhookInteractor: HandlePaymentWebhookInteractor,
  ) {}

  async getPriceList(): Promise<PriceListResponse> {
    return this.getPriceListInteractor.execute();
  }

  async createCheckoutSession(
    checkoutSessionDto: CreateCheckoutSessionDto,
    userData: Express.IUser,
  ): Promise<CheckoutSessionResponse> {
    return this.createCheckoutSessionInteractor.execute({ checkoutSessionDto, userData });
  }

  async getPayments(userId: string, query: ListPaymentsQueryDto): Promise<PaymentListResponse> {
    return this.listPaymentsInteractor.execute({ userId, query });
  }

  async handleWebhook(request: RawBodyRequest<Request>): Promise<void> {
    return this.handlePaymentWebhookInteractor.execute({ request });
  }
}
