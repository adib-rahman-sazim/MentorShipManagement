import { Inject, Injectable } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";
import { PAYMENT_PROVIDER } from "@/modules/payments/payments.constants";
import type { IPaymentProvider } from "@/modules/payments/payments.interfaces";

import type { ISubscriptionMutationContext } from "../subscriptions.interfaces";
import { SubscriptionsRepository } from "../subscriptions.repository";

@Injectable()
export class ResumeSubscriptionInteractor
  implements IBaseInteractor<ISubscriptionMutationContext, void>
{
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    @Inject(PAYMENT_PROVIDER)
    private readonly paymentProvider: IPaymentProvider,
  ) {}

  async execute({ userId, subscriptionId }: ISubscriptionMutationContext): Promise<void> {
    const subscription = await this.subscriptionsRepository.findOneOrFail({
      id: subscriptionId,
      user: { id: userId },
    });
    const providerSubscription = await this.paymentProvider.resumeSubscription(
      subscription.providerSubscriptionId,
    );
    this.subscriptionsRepository.assign(subscription, {
      providerSubscriptionId: providerSubscription.id,
      customerId: providerSubscription.customerId,
      priceId: providerSubscription.priceId,
      status: providerSubscription.status,
      currentPeriodStartAt: providerSubscription.currentPeriodStartAt,
      currentPeriodEndAt: providerSubscription.currentPeriodEndAt,
      cancelAtPeriodEnd: providerSubscription.cancelAtPeriodEnd,
    });
    this.subscriptionsRepository.persist(subscription);
    await this.subscriptionsRepository.flush();
  }
}
