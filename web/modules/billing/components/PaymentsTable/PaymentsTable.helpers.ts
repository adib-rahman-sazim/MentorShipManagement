import { format, parseISO } from "date-fns";

import {
  PAYMENT_AMOUNT_MINOR_UNIT_DIVISOR,
  PAYMENT_DATE_FORMAT,
  PAYMENT_ID_PREVIEW_LENGTH,
} from "@/modules/billing/components/PaymentsTable/PaymentsTable.constants";
import { IPaymentTableRow } from "@/modules/billing/components/PaymentsTable/PaymentsTable.interfaces";
import {
  EPaymentCurrency,
  EPaymentStatus,
  EPaymentType,
  type IPaymentItem,
} from "@/shared/typedefs/api";
import { ELocale } from "@/shared/typedefs/enums";

export function getPaymentStatusBadgeVariant(status: EPaymentStatus) {
  switch (status) {
    case EPaymentStatus.SUCCEEDED:
      return "default";
    case EPaymentStatus.PENDING:
      return "secondary";
    case EPaymentStatus.FAILED:
      return "destructive";
    default:
      return "outline";
  }
}

export function formatAmount(
  amount: number,
  currency: EPaymentCurrency,
  language: string = ELocale.ENGLISH,
) {
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / PAYMENT_AMOUNT_MINOR_UNIT_DIVISOR);
}

export function formatPaymentDate(createdAt: string) {
  return format(parseISO(createdAt), PAYMENT_DATE_FORMAT);
}

export function getPaymentTypeLabel(type: EPaymentType) {
  return type === EPaymentType.RECURRING ? "Recurring" : "One-time";
}

export function getPaymentTableRows(
  payments: IPaymentItem[],
  language: string = ELocale.ENGLISH,
): IPaymentTableRow[] {
  return payments.map((payment) => ({
    description: payment.description,
    formattedAmount: formatAmount(payment.amount, payment.currency, language),
    formattedDate: formatPaymentDate(payment.createdAt),
    id: payment.id,
    shortId: `${payment.id.slice(0, PAYMENT_ID_PREVIEW_LENGTH)}...`,
    status: payment.status,
    typeLabel: getPaymentTypeLabel(payment.type),
  }));
}
