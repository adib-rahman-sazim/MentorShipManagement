import { Module } from "@nestjs/common";

import { MikroOrmModule } from "@mikro-orm/nestjs";

import { Payment } from "@/common/entities/payments.entity";
import { Subscription } from "@/common/entities/subscriptions.entity";
import { User } from "@/common/entities/users.entity";

import { CreateCheckoutSessionInteractor } from "./interactors/create-checkout-session.interactor";
import { GetPriceListInteractor } from "./interactors/get-price-list.interactor";
import { HandlePaymentWebhookInteractor } from "./interactors/handle-payment-webhook.interactor";
import { ListPaymentsInteractor } from "./interactors/list-payments.interactor";
import { PaymentProviderModule } from "./payment-provider";
import { PaymentsController } from "./payments.controller";
import { PaymentsSerializer } from "./payments.serializer";
import { PaymentsService } from "./payments.service";

@Module({
  imports: [MikroOrmModule.forFeature([Payment, Subscription, User]), PaymentProviderModule],
  controllers: [PaymentsController],
  providers: [
    PaymentsSerializer,
    PaymentsService,
    GetPriceListInteractor,
    CreateCheckoutSessionInteractor,
    ListPaymentsInteractor,
    HandlePaymentWebhookInteractor,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
