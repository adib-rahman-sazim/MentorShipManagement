import { ApiProperty } from "@nestjs/swagger";

import { IsInt, IsOptional, IsString, IsUrl, Min } from "class-validator";

import { PaginationArgsDto, PaginationMetadataResponse } from "@/common/dtos/pagination.dtos";
import { EPaymentCurrency, EPaymentStatus, EPaymentType } from "@/common/enums/payments.enums";

export class CreateCheckoutSessionDto {
  @IsString()
  priceId!: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @IsString()
  @IsUrl({ require_tld: false })
  successUrl!: string;

  @IsString()
  @IsUrl({ require_tld: false })
  cancelUrl!: string;
}

class PaymentItem {
  id!: string;
  @ApiProperty({ enum: EPaymentType, enumName: "EPaymentType" })
  type!: EPaymentType;
  priceId!: string;
  quantity!: number;
  amount!: number;
  @ApiProperty({ enum: EPaymentCurrency, enumName: "EPaymentCurrency" })
  currency!: EPaymentCurrency;
  description!: string;
  @ApiProperty({ enum: EPaymentStatus, enumName: "EPaymentStatus" })
  status!: EPaymentStatus;
  createdAt!: Date;
  updatedAt!: Date;
}

export class ListPaymentsQueryDto extends PaginationArgsDto {}

export class PaymentListResponse {
  @ApiProperty({ type: [PaymentItem] })
  data!: PaymentItem[];

  @ApiProperty({ type: PaginationMetadataResponse })
  meta!: PaginationMetadataResponse;
}

class CheckoutSessionData {
  @IsString()
  checkoutUrl!: string;
}
export class CheckoutSessionResponse {
  @ApiProperty({ type: CheckoutSessionData })
  data!: CheckoutSessionData;
}

class PriceItemProduct {
  id!: string;
  name!: string;
  description!: string | null;
}
class PriceItemRecurring {
  interval!: string;
  intervalCount!: number;
  trialPeriodDays!: number | null;
}
class PriceItem {
  id!: string;
  amount!: number;

  @ApiProperty({ enum: EPaymentCurrency, enumName: "EPaymentCurrency" })
  currency!: EPaymentCurrency;

  @ApiProperty({ type: PriceItemProduct })
  product!: PriceItemProduct;

  @ApiProperty({ type: PriceItemRecurring, nullable: true })
  recurring!: PriceItemRecurring | null;
}

export class PriceListResponse {
  @ApiProperty({ type: [PriceItem] })
  data!: PriceItem[];
}
