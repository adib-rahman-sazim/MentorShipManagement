import { Injectable } from "@nestjs/common";

import { AbstractBaseSerializer } from "@/common/serializers";

@Injectable()
export class SubscriptionsSerializer extends AbstractBaseSerializer {
  protected serializeOneOptions = {
    skipNull: true,
    forceObject: true,
    exclude: ["user", "providerSubscriptionId", "customerId"],
  };

  protected serializeManyOptions = {
    skipNull: true,
    forceObject: true,
    exclude: ["user", "providerSubscriptionId", "customerId"],
  };
}
