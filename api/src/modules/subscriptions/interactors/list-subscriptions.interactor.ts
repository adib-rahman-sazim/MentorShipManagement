import { Injectable } from "@nestjs/common";

import type { IBaseInteractor } from "@/common/interfaces/base-interactor.interfaces";

import type { SubscriptionListResponseDto } from "../subscriptions.dtos";
import type { IListSubscriptionsContext } from "../subscriptions.interfaces";
import { SubscriptionsRepository } from "../subscriptions.repository";
import { SubscriptionsSerializer } from "../subscriptions.serializer";

@Injectable()
export class ListSubscriptionsInteractor
  implements IBaseInteractor<IListSubscriptionsContext, SubscriptionListResponseDto>
{
  constructor(
    private readonly subscriptionsRepository: SubscriptionsRepository,
    private readonly subscriptionsSerializer: SubscriptionsSerializer,
  ) {}

  async execute({ userId }: IListSubscriptionsContext): Promise<SubscriptionListResponseDto> {
    const subscriptions = await this.subscriptionsRepository.findAll({
      where: { user: { id: userId } },
    });
    return {
      data: this.subscriptionsSerializer.serializeMany(subscriptions),
    };
  }
}
