import { Check } from "lucide-react";

import { formatPrice } from "@/modules/pricing/components/PricingCard/PricingCard.helpers";
import type { IPricingCardProps } from "@/modules/pricing/components/PricingCard/PricingCard.interfaces";
import { Badge } from "@/shared/components/shadui/badge";
import { Button } from "@/shared/components/shadui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/shadui/card";

export const PricingCard = ({
  price,
  onPay,
  isPopular = false,
  isPaying = false,
}: IPricingCardProps) => {
  const isRecurring = !!price.recurring?.interval;
  const hasTrial = price.recurring?.trialPeriodDays && price.recurring.trialPeriodDays > 0;

  let payButtonLabel = "Purchase Now";
  if (isPaying) {
    payButtonLabel = "Redirecting...";
  } else if (isRecurring) {
    payButtonLabel = "Get Started";
  }

  return (
    <Card
      className={`relative flex w-full max-w-sm flex-col transition-all duration-300 hover:shadow-lg ${
        isPopular
          ? "border-primary shadow-lg scale-105 md:scale-110"
          : "hover:scale-105 border-border"
      }`}
    >
      {isPopular ? (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground px-4 py-1">Most Popular</Badge>
        </div>
      ) : null}

      <CardHeader className="text-center pb-4">
        <CardTitle className="text-2xl font-bold mb-2">{price.product.name}</CardTitle>

        <div className="flex items-baseline justify-center gap-1 mb-2">
          <span className="text-5xl font-bold tracking-tight">
            {formatPrice(price.amount, price.currency)}
          </span>
          {isRecurring && price.recurring ? (
            <span className="text-xl font-medium text-muted-foreground">
              /{price.recurring.interval}
            </span>
          ) : null}
        </div>
        {hasTrial && price.recurring ? (
          <CardDescription className="text-sm font-medium text-primary">
            {price.recurring.trialPeriodDays} days free trial
          </CardDescription>
        ) : null}
        {!isRecurring ? (
          <CardDescription className="text-sm">One-time payment</CardDescription>
        ) : null}
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground">Full access to all features</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground">
              {isRecurring ? "Cancel anytime" : "Lifetime access"}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground">Priority support</span>
          </div>
          <div className="flex items-start gap-3">
            <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
            <span className="text-sm text-muted-foreground">Regular updates</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-6">
        <Button
          className={`w-full ${isPopular ? "bg-primary hover:bg-primary/90" : ""}`}
          onClick={() => onPay(price.id)}
          disabled={isPaying}
          size="lg"
        >
          {payButtonLabel}
        </Button>
      </CardFooter>
    </Card>
  );
};
