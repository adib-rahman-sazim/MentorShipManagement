import { Injectable } from "@nestjs/common";

import { AbstractBaseSerializer } from "@/common/serializers";

import type { CheckoutSessionResponse, PriceListResponse } from "./payments.dtos";
import type { IPrice } from "./payments.interfaces";

@Injectable()
export class PaymentsSerializer extends AbstractBaseSerializer {
  protected serializeOneOptions = {
    skipNull: true,
    forceObject: true,
    exclude: ["user", "subscription", "provider", "metadata", "externalId", "productId"],
  };

  protected serializeManyOptions = {
    skipNull: true,
    forceObject: true,
    exclude: ["user", "subscription", "provider", "metadata", "externalId", "productId"],
  };

  serializeCheckoutSession(checkoutUrl: string): CheckoutSessionResponse {
    return {
      data: {
        checkoutUrl,
      },
    };
  }

  serializePriceList(prices: IPrice[]): PriceListResponse {
    return {
      data: prices.map((price) => ({ ...price, product: price.product! })),
    };
  }
}
