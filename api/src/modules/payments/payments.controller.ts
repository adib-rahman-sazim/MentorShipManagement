import { Body, Controller, Get, Post, Query, type RawBodyRequest, Req } from "@nestjs/common";

import type { Request as ExpressRequest } from "express";

import { Public } from "@/common/decorators/auth/public.decorator";

import {
  CheckoutSessionResponse,
  CreateCheckoutSessionDto,
  ListPaymentsQueryDto,
  PaymentListResponse,
  PriceListResponse,
} from "./payments.dtos";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  getPayments(
    @Query() query: ListPaymentsQueryDto,
    @Req() req: ExpressRequest,
  ): Promise<PaymentListResponse> {
    return this.paymentsService.getPayments(req.user!.id, query);
  }

  @Get("price-list")
  @Public()
  getPriceList(): Promise<PriceListResponse> {
    return this.paymentsService.getPriceList();
  }

  @Post("checkout-session")
  createCheckoutSession(
    @Body() createPaymentDto: CreateCheckoutSessionDto,
    @Req() req: ExpressRequest,
  ): Promise<CheckoutSessionResponse> {
    return this.paymentsService.createCheckoutSession(createPaymentDto, req.user!);
  }

  @Post("webhook")
  @Public()
  async handleWebhook(@Req() req: RawBodyRequest<Request>): Promise<{ success: boolean }> {
    await this.paymentsService.handleWebhook(req);
    return { success: true };
  }
}
