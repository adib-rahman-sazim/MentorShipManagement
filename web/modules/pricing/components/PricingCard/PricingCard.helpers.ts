import { PAYMENT_AMOUNT_MINOR_UNIT_DIVISOR } from "@/modules/billing/components/PaymentsTable/PaymentsTable.constants";
import { EPaymentCurrency } from "@/shared/typedefs/api";
import { ELocale } from "@/shared/typedefs/enums";

export function formatPrice(
  price: number,
  currency: EPaymentCurrency,
  language: string = ELocale.ENGLISH,
) {
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency: currency.toLowerCase(),
  }).format(price / PAYMENT_AMOUNT_MINOR_UNIT_DIVISOR);
}
