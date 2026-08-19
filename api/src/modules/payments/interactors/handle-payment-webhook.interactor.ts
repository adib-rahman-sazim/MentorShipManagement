import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";

import { EPaymentStatus, EPaymentType, EPaymentWebhookEvent } from "@/common/enums/payments.enums";
import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { SubscriptionsRepository } from "@/modules/subscriptions/subscriptions.repository";

import { PAYMENT_PROVIDER } from "../payments.constants";
import type { IHandlePaymentWebhookContext, IPaymentProvider } from "../payments.interfaces";
import { PaymentsRepository } from "../payments.repository";

@Injectable()
export class HandlePaymentWebhookInteractor
  implements IBaseInteractor<IHandlePaymentWebhookContext, void>
{
  private readonly logger = new Logger(HandlePaymentWebhookInteractor.name);

  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly subscriptionsRepository: SubscriptionsRepository,
    @Inject(PAYMENT_PROVIDER)
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async execute({ request }: IHandlePaymentWebhookContext): Promise<void> {
    try {
      const { provider, payload } = await this.paymentProvider.handleWebhook(request);

      await this.paymentsRepository.transactional(async (em) => {
        switch (payload.event) {
          case EPaymentWebhookEvent.CHECKOUT_COMPLETED: {
            if (!payload.data) {
              throw new BadRequestException("Invalid webhook data");
            }
            const payment = await this.paymentsRepository.findByExternalId(
              payload.data.sessionId,
              em,
            );
            if (!payment) {
              throw new NotFoundException("Payment not found");
            }
            payment.status = EPaymentStatus.SUCCEEDED;
            payment.amount = payload.data.amount;
            payment.currency = payload.data.currency;
            if (payload.data.subscription) {
              const subscription =
                (await this.subscriptionsRepository.findByProviderSubscriptionId(
                  payload.data.subscription.id,
                  em,
                )) ??
                this.subscriptionsRepository.createSubscription(
                  {
                    providerSubscriptionId: payload.data.subscription.id,
                    customerId: payload.data.subscription.customerId,
                    priceId: payload.data.subscription.priceId,
                    status: payload.data.subscription.status,
                    currentPeriodStartAt: payload.data.subscription.currentPeriodStartAt,
                    currentPeriodEndAt: payload.data.subscription.currentPeriodEndAt,
                    cancelAtPeriodEnd: payload.data.subscription.cancelAtPeriodEnd,
                    user: payment.user,
                  },
                  em,
                );
              this.subscriptionsRepository.assign(subscription, {
                customerId: payload.data.subscription.customerId,
                priceId: payload.data.subscription.priceId,
                status: payload.data.subscription.status,
                currentPeriodStartAt: payload.data.subscription.currentPeriodStartAt,
                currentPeriodEndAt: payload.data.subscription.currentPeriodEndAt,
                cancelAtPeriodEnd: payload.data.subscription.cancelAtPeriodEnd,
              });
              payment.subscription = subscription;
              this.subscriptionsRepository.persist(subscription, em);
            }
            this.paymentsRepository.persist(payment, em);
            break;
          }

          case EPaymentWebhookEvent.PAYMENT_SUCCEEDED: {
            const { subscriptionId, invoiceId, ...paymentData } = payload.data;
            const subscription =
              await this.subscriptionsRepository.findByProviderSubscriptionIdForUpdate(
                subscriptionId,
                em,
              );
            if (!subscription) {
              throw new NotFoundException(`Subscription not found for id: ${subscriptionId}`);
            }

            const existingPayment = await this.paymentsRepository.findByExternalId(invoiceId, em);
            if (existingPayment) {
              break;
            }

            const newPayment = this.paymentsRepository.createPayment(
              {
                provider,
                externalId: invoiceId,
                status: EPaymentStatus.SUCCEEDED,
                type: EPaymentType.RECURRING,
                user: subscription.user,
                subscription,
                ...paymentData,
              },
              em,
            );
            this.paymentsRepository.persist(newPayment, em);
            break;
          }

          case EPaymentWebhookEvent.SUBSCRIPTION_UPDATED: {
            const subscription = await this.subscriptionsRepository.findByProviderSubscriptionId(
              payload.data.id,
              em,
            );
            if (!subscription) {
              throw new NotFoundException("Subscription not found for SUBSCRIPTION_UPDATED");
            }
            subscription.status = payload.data.status;
            subscription.currentPeriodStartAt = payload.data.currentPeriodStartAt;
            subscription.currentPeriodEndAt = payload.data.currentPeriodEndAt;
            subscription.cancelAtPeriodEnd = payload.data.cancelAtPeriodEnd;
            subscription.customerId = payload.data.customerId;
            subscription.priceId = payload.data.priceId;
            this.subscriptionsRepository.persist(subscription, em);
            break;
          }

          case EPaymentWebhookEvent.CHECKOUT_EXPIRED: {
            const payment = await this.paymentsRepository.findByExternalId(
              payload.data.sessionId,
              em,
            );
            if (payment) {
              payment.status = EPaymentStatus.FAILED;
              this.paymentsRepository.persist(payment, em);
            }
            break;
          }
        }
        await this.paymentsRepository.flush(em);
      });
    } catch (error) {
      this.logger.error("Webhook event processing failed", error);
      throw new BadRequestException("Webhook event processing failed");
    }
  }
}
