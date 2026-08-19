import { ApiProperty } from "@nestjs/swagger";

import { ESubscriptionStatus } from "@/common/enums/subscriptions.enums";

class SubscriptionDto {
  id!: string;
  priceId!: string;
  currentPeriodStartAt!: Date;
  currentPeriodEndAt!: Date;
  cancelAtPeriodEnd!: boolean;
  @ApiProperty({ enum: ESubscriptionStatus, enumName: "ESubscriptionStatus" })
  status!: ESubscriptionStatus;
  createdAt!: Date;
  updatedAt!: Date;
}

export class SubscriptionListResponseDto {
  @ApiProperty({ type: [SubscriptionDto] })
  data!: SubscriptionDto[];
}
