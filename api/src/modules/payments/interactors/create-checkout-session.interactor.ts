import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { EPaymentStatus } from "@/common/enums/payments.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { SubscriptionsRepository } from "@/modules/subscriptions/subscriptions.repository";
import { UsersRepository } from "@/modules/users/users.repository";

import {
  BLOCKING_SUBSCRIPTION_STATUSES,
  CHECKOUT_TRANSACTION_TIMEOUT_MS,
  MULTIPLE_SUBSCRIPTIONS_ALLOWED,
  PAYMENT_PROVIDER,
} from "../payments.constants";
import type { CheckoutSessionResponse } from "../payments.dtos";
import { isAllowedCheckoutRedirectUrl } from "../payments.helpers";
import type { ICreateCheckoutSessionContext, IPaymentProvider } from "../payments.interfaces";
import { PaymentsRepository } from "../payments.repository";
import { PaymentsSerializer } from "../payments.serializer";

@Injectable()
export class CreateCheckoutSessionInteractor
  implements IBaseInteractor<ICreateCheckoutSessionContext, CheckoutSessionResponse>
{
  private readonly logger = new Logger(CreateCheckoutSessionInteractor.name);

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly usersRepository: UsersRepository,
    @Inject(PAYMENT_PROVIDER)
    private readonly paymentProvider: IPaymentProvider,
    private readonly configService: ConfigService,
    private readonly paymentsSerializer: PaymentsSerializer,
  ) {}

  async execute({
    checkoutSessionDto,
    userData,
  }: ICreateCheckoutSessionContext): Promise<CheckoutSessionResponse> {
    try {
      const webClientBaseUrl = this.configService.getOrThrow<string>("WEB_CLIENT_BASE_URL");
      if (
        !isAllowedCheckoutRedirectUrl(checkoutSessionDto.successUrl, webClientBaseUrl) ||
        !isAllowedCheckoutRedirectUrl(checkoutSessionDto.cancelUrl, webClientBaseUrl)
      ) {
        throw new BadRequestException("Checkout redirect URLs must match the web client origin");
      }

      const selectedPrice = await this.paymentProvider.getPriceById(checkoutSessionDto.priceId);

      return await this.paymentsRepository.transactional(async (em) => {
        await em.execute(
          `SET LOCAL idle_in_transaction_session_timeout = '${CHECKOUT_TRANSACTION_TIMEOUT_MS}'`,
        );

        const user = await this.usersRepository.findByIdForUpdate(userData.id, em);

        if (!MULTIPLE_SUBSCRIPTIONS_ALLOWED && selectedPrice?.recurring) {
          const existingSubscription = await this.subscriptionsRepository.findByUserIdWithStatuses(
            {
              userId: userData.id,
              statuses: BLOCKING_SUBSCRIPTION_STATUSES,
            },
            em,
          );
          if (existingSubscription) {
            throw new BadRequestException("You already have an active subscription");
          }

          const pendingRecurringPayment =
            await this.paymentsRepository.findPendingRecurringByUserId(userData.id, em);
          if (pendingRecurringPayment) {
            throw new BadRequestException("A subscription checkout session is already pending");
          }
        }

        const existingSubscription = await this.subscriptionsRepository.findByUserId(
          userData.id,
          em,
        );
        const { paymentType, ...checkoutSession } =
          await this.paymentProvider.createCheckoutSession({
            ...checkoutSessionDto,
            userData,
            customerId: existingSubscription?.customerId,
          });

        const payment = this.paymentsRepository.createPayment(
          {
            externalId: checkoutSession.sessionId,
            status: EPaymentStatus.PENDING,
            type: paymentType,
            user,
            ...checkoutSession,
          },
          em,
        );
        this.paymentsRepository.persist(payment, em);
        await this.paymentsRepository.flush(em);

        return this.paymentsSerializer.serializeCheckoutSession(checkoutSession.checkoutUrl);
      });
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error("Failed to create payment", error);
      throw new BadRequestException(
        `Failed to create payment: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }
}
