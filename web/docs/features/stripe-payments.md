# Stripe Payments (Frontend)

The pricing page reads Stripe prices from the backend and redirects authenticated users to Stripe Checkout. Recurring prices render as subscription cards; one-time prices render as lifetime-style cards beside them (recurring first). The billing page shows payment history with Type `Recurring` or `One-time` after Stripe sends the successful checkout webhook to the backend.

Backend secrets, product/price setup, and webhook listener steps live in the NestJS template payments module README (`nestjs-mikro-orm-starter-template/src/modules/payments/README.md`).

## Local testing

1. Run the backend on the URL configured in `NEXT_PUBLIC_API_BASE_URL`.
2. Make sure the backend has `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, and **both** a recurring and a one-time Stripe product price configured (see the NestJS payments README above).
3. Sign in, open `/pricing`, complete a one-time or subscription checkout with a Stripe sandbox card, and verify the payment Type on `/billing`.
