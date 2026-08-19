# Payments Module Usage Guide

Canonical Stripe local setup for this template (products, secrets, webhooks). Root README links here instead of repeating these steps.

The Payments module provides a common interface and implementation for payment functionalities, including price listing, checkout sessions, and handling provider webhooks. It is designed according to the NestJS best practices and is extensible for future payment providers.

---

## Stripe Integration Instructions

Follow these steps to enable and test Stripe payments in the local environment:

### 1. Create a Stripe Account

- Register for a [Stripe account](https://dashboard.stripe.com/register) if you don't already have one.
- In the Stripe Dashboard (test mode), go to **Product catalog > Create product** and create **two** products/prices for the pricing example:
  - **Recurring**: Product with a recurring Price (e.g. monthly). Checkout uses `mode=subscription` and stores payment type `recurring`.
  - **One-time**: Product with a one-time Price (no billing interval). Checkout uses `mode=payment` and stores payment type `one_off`. The frontend may show this as “Lifetime access”; that is UI copy only, not a separate entitlement entity.
- Both active prices are returned by `GET /payments/price-list` and appear side by side on `/pricing` (recurring left, one-time right after sort).

### 2. Obtain Stripe Secrets

#### a. Get `STRIPE_SECRET_KEY`

- From your [Stripe dashboard](https://dashboard.stripe.com/apikeys), copy the API key for your **sandbox (test)** environment.
- Set it in your `.env`:
  ```
  STRIPE_SECRET_KEY=sk_test_...
  ```

#### b. Listen for Webhook Events

- Preferred: start the full local stack (Stripe CLI is a compose service pinned to `stripe/stripe-cli:v1.42.0`):
  ```
  docker compose -f ./docker-compose.local.yml --env-file .env.development.local up
  ```
- Stripe-only convenience (same compose service):
  ```
  pnpm stripe:listen
  ```

#### c. Get `STRIPE_WEBHOOK_SECRET`

- After Stripe CLI is up, open a new terminal and run:
  ```
  docker compose -f ./docker-compose.local.yml logs stripe-cli
  ```
- You will see logs like:
  ```
  stripe-cli-1  | Getting ready...
  stripe-cli-1  | Ready! You are using Stripe API Version [2025-09-30.clover]. Your webhook signing secret is whsec_f2e8xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxdbf022 
  ```
- Copy the `whsec_...` value from `Your webhook signing secret is ...` and add to your `.env`:
  ```
  STRIPE_WEBHOOK_SECRET=whsec_f2e8xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxdbf022
  ```

---

## Integration Guide

1. **Configure Payment Provider**

   - By default, the module uses a `StripeService` implementation via the `IPaymentProvider` interface.
   - To add custom providers, implement the `IPaymentProvider` interface and inject your service in the module/service constructor.

2. **Payment Entity & Repository**
   - Use `PaymentsRepository` for custom payment queries (extends `CustomSQLBaseRepository`).
   - Use relations for linking payments to your users and other domain entities.

3. **Serialization**
   - `PaymentsSerializer` handles formatting of API responses according to business rules.

4. **Custom Logic**
   - For custom post-payment logic (e.g., granting access), you can extend `PaymentsService` and add hooks after webhook processing.

---

## Extending

To support a new provider:
1. Create a service implementing `IPaymentProvider`.
2. Register it as the main provider in the module.
3. Update the controller/service if provider-specific logic is needed.
