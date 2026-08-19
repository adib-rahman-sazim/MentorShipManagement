import type { RawBodyRequest } from "@nestjs/common";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

// biome-ignore lint/correctness/noUnresolvedImports: stripe ambient declare module is not resolved by biome
import Stripe from "stripe";

import {
  EPaymentCurrency,
  EPaymentProvider,
  EPaymentType,
  EPaymentWebhookEvent,
} from "@/common/enums/payments.enums";

import type {
  ICheckoutSessionRequest,
  ICheckoutSessionResponse,
  IPaymentProvider,
  IPrice,
  IProviderSubscription,
  IWebhookResponse,
} from "../../payments.interfaces";
import { getProviderSubscriptionFromStripeSubscription } from "./stripe.helpers";

@Injectable()
export class StripeService implements IPaymentProvider {
  private readonly logger = new Logger(StripeService.name);
  private readonly stripe: Stripe;

  readonly provider = EPaymentProvider.STRIPE;

  constructor(private readonly configService: ConfigService) {
    this.stripe = new Stripe(this.configService.getOrThrow<string>("STRIPE_SECRET_KEY"));
  }

  async getPriceList(): Promise<IPrice[]> {
    const prices = await this.stripe.prices.list({ expand: ["data.product"] });

    return prices.data
      .filter((price) => typeof price.product === "object" && !("deleted" in price.product))
      .map((price) => {
        const product = price.product as Stripe.Product;
        return {
          id: price.id,
          amount: price.unit_amount ?? 0,
          currency: price.currency as EPaymentCurrency,
          product: {
            id: product.id,
            name: product.name,
            description: product.description,
          },
          recurring: price.recurring
            ? {
                interval: price.recurring.interval,
                intervalCount: price.recurring.interval_count,
                trialPeriodDays: price.recurring.trial_period_days,
              }
            : null,
        };
      });
  }

  async getPriceById(priceId: string): Promise<IPrice> {
    const price = await this.stripe.prices.retrieve(priceId, { expand: ["product"] });
    if (typeof price.product !== "object" || "deleted" in price.product) {
      throw new Error("Price not found");
    }
    return {
      id: price.id,
      amount: price.unit_amount ?? 0,
      currency: price.currency as EPaymentCurrency,
      product: {
        id: price.product.id,
        name: price.product.name,
        description: price.product.description,
      },
      recurring: price.recurring
        ? {
            interval: price.recurring.interval,
            intervalCount: price.recurring.interval_count,
            trialPeriodDays: price.recurring.trial_period_days,
          }
        : null,
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<IProviderSubscription> {
    const subscription = await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return getProviderSubscriptionFromStripeSubscription(subscription);
  }

  async resumeSubscription(subscriptionId: string): Promise<IProviderSubscription> {
    const subscription = await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false,
    });
    return getProviderSubscriptionFromStripeSubscription(subscription);
  }

  async createCheckoutSession(request: ICheckoutSessionRequest): Promise<ICheckoutSessionResponse> {
    const quantity = request.quantity ?? 1;

    const price = await this.getPriceById(request.priceId);

    const checkoutSession = await this.stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: price.recurring ? "subscription" : "payment",
      ui_mode: "hosted",
      line_items: [{ price: request.priceId, quantity }],
      success_url: request.successUrl,
      cancel_url: request.cancelUrl,
      customer_email: request.customerId ? undefined : request.userData.email,
      customer: request.customerId,
      metadata: request.metadata,
    });

    if (checkoutSession.url) {
      return {
        provider: EPaymentProvider.STRIPE,
        paymentType: price.recurring ? EPaymentType.RECURRING : EPaymentType.ONE_OFF,
        sessionId: checkoutSession.id,
        checkoutUrl: checkoutSession.url,
        amount: checkoutSession.amount_total ?? 0,
        currency: (checkoutSession.currency as EPaymentCurrency) ?? EPaymentCurrency.USD,
        productId: price.product!.id,
        priceId: price.id,
        quantity,
        description: price.product!.name,
        metadata: checkoutSession.metadata ?? undefined,
      };
    }
    throw new Error("Failed to create checkout session");
  }

  async handleWebhook(request: RawBodyRequest<Request>): Promise<IWebhookResponse> {
    const webhookSecret = this.configService.get<string>("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
      throw new Error("STRIPE_WEBHOOK_SECRET is required");
    }

    try {
      const event = this.stripe.webhooks.constructEvent(
        request.rawBody as Buffer,
        new Headers(request.headers).get("stripe-signature") as string,
        webhookSecret,
      );

      switch (event.type) {
        case "checkout.session.completed": {
          const sessionObj = event.data.object as Stripe.Checkout.Session;
          const subscription = sessionObj.subscription
            ? await this.stripe.subscriptions.retrieve(sessionObj.subscription as string)
            : undefined;

          return {
            provider: this.provider,
            payload: {
              event: EPaymentWebhookEvent.CHECKOUT_COMPLETED,
              data: {
                sessionId: sessionObj.id,
                clientReferenceId: sessionObj.client_reference_id,
                amount: sessionObj.amount_total ?? 0,
                currency: sessionObj.currency as EPaymentCurrency,
                subscription: subscription
                  ? getProviderSubscriptionFromStripeSubscription(subscription)
                  : undefined,
              },
            },
          };
        }

        case "invoice.payment_succeeded": {
          const lineItem = event.data.object.lines.data[0];
          const subscriptionId = event.data.object.parent?.subscription_details?.subscription;

          if (
            event.data.object.billing_reason !== "subscription_cycle" ||
            !subscriptionId ||
            !lineItem.pricing?.price_details
          ) {
            return {
              provider: this.provider,
              payload: { event: EPaymentWebhookEvent.UNHANDLED },
            };
          }

          return {
            provider: this.provider,
            payload: {
              event: EPaymentWebhookEvent.PAYMENT_SUCCEEDED,
              data: {
                subscriptionId: subscriptionId as string,
                invoiceId: event.data.object.id,
                amount: lineItem.amount,
                currency: lineItem.currency as EPaymentCurrency,
                description: lineItem.description ?? "",
                productId: lineItem.pricing.price_details.product,
                priceId: lineItem.pricing.price_details.price,
                quantity: lineItem.quantity ?? 0,
                metadata: event.data.object.metadata as Record<string, string | number | null>,
              },
            },
          };
        }
        case "customer.subscription.deleted":
        case "customer.subscription.updated": {
          const subscription = event.data.object;
          return {
            provider: this.provider,
            payload: {
              event: EPaymentWebhookEvent.SUBSCRIPTION_UPDATED,
              data: getProviderSubscriptionFromStripeSubscription(subscription),
            },
          };
        }

        case "checkout.session.expired": {
          return {
            provider: this.provider,
            payload: {
              event: EPaymentWebhookEvent.CHECKOUT_EXPIRED,
              data: {
                sessionId: event.data.object.id,
              },
            },
          };
        }

        default:
          this.logger.log(`Unhandled Stripe webhook event type: ${event.type}`);
          return {
            provider: this.provider,
            payload: {
              event: EPaymentWebhookEvent.UNHANDLED,
            },
          };
      }
    } catch (error) {
      if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
        this.logger.error("Invalid webhook signature", error);
      } else {
        this.logger.error("Failed to handle Stripe webhook", error);
      }
      throw new Error("Failed to handle Stripe webhook");
    }
  }
}
