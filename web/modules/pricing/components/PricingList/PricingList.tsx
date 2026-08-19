import { PricingCard } from "@/modules/pricing/components/PricingCard";
import {
  getPricingFooterText,
  sortPricesForDisplay,
} from "@/modules/pricing/components/PricingList/PricingList.helpers";
import { usePricing } from "@/modules/pricing/components/PricingList/PricingList.hooks";
import { Skeleton } from "@/shared/components/shadui/skeleton";

export const PricingList = () => {
  const { checkoutPriceId, priceList, isLoading, handlePay } = usePricing();
  const sortedPriceList = sortPricesForDisplay(priceList);
  const footerText = getPricingFooterText(sortedPriceList);

  return (
    <>
      {isLoading ? (
        <div className="w-full bg-linear-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-4xl text-center mb-12 md:mb-16 space-y-4">
              <Skeleton className="mx-auto h-12 w-72" />
              <Skeleton className="mx-auto h-5 w-96 max-w-full" />
            </div>
            <div className="flex flex-col items-center gap-8 md:flex-row md:justify-center md:items-stretch lg:gap-6">
              <Skeleton className="h-96 w-full max-w-sm rounded-xl" />
              <Skeleton className="h-96 w-full max-w-sm rounded-xl" />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full bg-linear-to-b from-background to-muted/20">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-4xl text-center mb-12 md:mb-16">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl mb-4">
                Choose Your Plan
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Select the perfect plan for your needs. All plans include our core features with
                flexible payment options.
              </p>
            </div>

            <div className="flex flex-col items-center gap-8 md:flex-row md:justify-center md:items-stretch lg:gap-6">
              {sortedPriceList.map((price, index) => (
                <PricingCard
                  key={price.id}
                  price={price}
                  onPay={handlePay}
                  isPopular={index === 1 && sortedPriceList.length > 2}
                  isPaying={checkoutPriceId === price.id}
                />
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">{footerText}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
