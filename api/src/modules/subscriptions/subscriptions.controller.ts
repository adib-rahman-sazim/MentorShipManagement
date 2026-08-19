import { Controller, Get, Param, Post, Session, UseGuards } from "@nestjs/common";

import { SessionGuard } from "@/common/guards/session.guard";

import { SubscriptionListResponseDto } from "./subscriptions.dtos";
import { SubscriptionsService } from "./subscriptions.service";

@UseGuards(SessionGuard)
@Controller("subscriptions")
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  getSubscriptions(
    @Session() session: { user: Express.IUser; session: Express.ISession },
  ): Promise<SubscriptionListResponseDto> {
    return this.subscriptionsService.getSubscriptions(session.user.id);
  }

  @Post(":id/cancel")
  cancelSubscription(
    @Param("id") subscriptionId: string,
    @Session() session: { user: Express.IUser; session: Express.ISession },
  ): Promise<void> {
    return this.subscriptionsService.cancelSubscription(session.user.id, subscriptionId);
  }

  @Post(":id/resume")
  resumeSubscription(
    @Param("id") subscriptionId: string,
    @Session() session: { user: Express.IUser; session: Express.ISession },
  ): Promise<void> {
    return this.subscriptionsService.resumeSubscription(session.user.id, subscriptionId);
  }
}
