import { Injectable } from "@nestjs/common";

import { CancelSubscriptionInteractor } from "./interactors/cancel-subscription.interactor";
import { ListSubscriptionsInteractor } from "./interactors/list-subscriptions.interactor";
import { ResumeSubscriptionInteractor } from "./interactors/resume-subscription.interactor";
import type { SubscriptionListResponseDto } from "./subscriptions.dtos";

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly listSubscriptionsInteractor: ListSubscriptionsInteractor,
    private readonly cancelSubscriptionInteractor: CancelSubscriptionInteractor,
    private readonly resumeSubscriptionInteractor: ResumeSubscriptionInteractor,
  ) {}

  async getSubscriptions(userId: string): Promise<SubscriptionListResponseDto> {
    return this.listSubscriptionsInteractor.execute({ userId });
  }

  async cancelSubscription(userId: string, subscriptionId: string): Promise<void> {
    return this.cancelSubscriptionInteractor.execute({ userId, subscriptionId });
  }

  async resumeSubscription(userId: string, subscriptionId: string): Promise<void> {
    return this.resumeSubscriptionInteractor.execute({ userId, subscriptionId });
  }
}
