import type { IPriceItem } from "@/shared/typedefs/api";

export interface IPricingCardProps {
  price: IPriceItem;
  onPay: (priceId: string) => void | Promise<void>;
  isPopular?: boolean;
  isPaying?: boolean;
}
