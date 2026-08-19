import { Module } from "@nestjs/common";

import { PAYMENT_PROVIDER } from "../payments.constants";
import { StripeService } from "../providers/stripe";

@Module({
  providers: [
    {
      provide: PAYMENT_PROVIDER,
      useClass: StripeService,
    },
  ],
  exports: [PAYMENT_PROVIDER],
})
export class PaymentProviderModule {}
