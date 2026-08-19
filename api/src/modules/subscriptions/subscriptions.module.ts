import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Subscription } from "@/common/entities/subscriptions.entity";

import { AuthModule } from "../auth/auth.module";
import { PaymentProviderModule } from "../payments/payment-provider";
import { CancelSubscriptionInteractor } from "./interactors/cancel-subscription.interactor";
import { ListSubscriptionsInteractor } from "./interactors/list-subscriptions.interactor";
import { ResumeSubscriptionInteractor } from "./interactors/resume-subscription.interactor";
import { SubscriptionsController } from "./subscriptions.controller";
import { SubscriptionsSerializer } from "./subscriptions.serializer";
import { SubscriptionsService } from "./subscriptions.service";

@Module({
  imports: [MikroOrmModule.forFeature([Subscription]), PaymentProviderModule, AuthModule],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionsSerializer,
    ListSubscriptionsInteractor,
    CancelSubscriptionInteractor,
    ResumeSubscriptionInteractor,
  ],
  exports: [
    MikroOrmModule.forFeature([Subscription]),
    SubscriptionsService,
    SubscriptionsSerializer,
  ],
})
export class SubscriptionsModule {}
